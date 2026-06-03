package com.eventpilot.manager;

import com.eventpilot.dto.GenerationResult;
import com.eventpilot.dto.ResultSectionDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AiGenerationManager {

  private static final int MAX_PASTED_MATERIALS_LENGTH = 20_000;
  private static final Pattern FENCED_JSON_PATTERN =
      Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```");

  private static final Map<String, String> MODE_LABELS = Map.of(
      "startup", "活动启动包",
      "review", "活动复盘包",
      "handoff", "换届交接包");

  private static final Map<String, String> MODE_INSTRUCTIONS = Map.of(
      "startup",
      "用户正在策划一个新活动。请生成完整的活动启动包，帮助团队从零开始准备。内容包括活动概览、时间线、预算、分工、当天流程和检查清单。",
      "review",
      "用户需要对已结束的活动进行复盘。请生成活动复盘包，帮助团队整理活动数据、总结经验教训、发现问题并提出改进建议。如果用户未提供活动的实际数据或反馈，在相关章节中标注「需补充信息」。",
      "handoff",
      "用户需要把活动经验和流程交接给下一届负责人。请生成换届交接包，重点是流程文档、注意事项、历史经验和可复用的模板。语气应面向接手的新人，清楚说明「做什么」和「为什么」。");

  private static final Map<String, List<String>> EXPECTED_SECTION_TITLES = Map.of(
      "startup",
      List.of("活动概览", "时间线 Checklist", "预算项目清单", "人员分工建议", "活动当天流程", "活动前 48 小时检查清单"),
      "review",
      List.of("活动回顾", "数据与反馈汇总", "问题与不足", "改进建议", "经验总结", "后续行动清单"),
      "handoff",
      List.of("活动概况", "流程文档", "关键联系人", "历史经验", "注意事项", "可复用资源"));

  private static final Map<String, List<String>> EXPECTED_SECTION_IDS = Map.of(
      "startup",
      List.of("overview", "timeline", "budget", "roles", "schedule", "checklist"),
      "review",
      List.of("overview", "data", "issues", "improvements", "summary", "actions"),
      "handoff",
      List.of("overview", "process", "contacts", "history", "notes", "resources"));

  private final TaskManager taskManager;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;
  private final String apiKey;
  private final String baseUrl;
  private final String model;

  public AiGenerationManager(
      TaskManager taskManager,
      ObjectMapper objectMapper,
      @Value("${eventpilot.ai.api-key:}") String apiKey,
      @Value("${eventpilot.ai.base-url:https://api.openai.com/v1}") String baseUrl,
      @Value("${eventpilot.ai.model:gpt-4o-mini}") String model) {
    this.taskManager = taskManager;
    this.objectMapper = objectMapper;
    this.httpClient = HttpClient.newHttpClient();
    this.apiKey = apiKey;
    this.baseUrl = trimTrailingSlash(baseUrl);
    this.model = model;
  }

  @Async("generationExecutor")
  public void generateInBackground(String taskId, ValidatedTaskInput input) {
    try {
      GenerationResult result = generateTaskSections(input);
      saveTaskGenerationResult(taskId, result);
    } catch (Exception exception) {
      System.err.println("[EventPilot] generation failed " + taskId + ": " + exception.getMessage());
      setTaskError(taskId);
    }
  }

  private GenerationResult generateTaskSections(ValidatedTaskInput input)
      throws IOException, InterruptedException {
    if (apiKey == null || apiKey.isBlank()) {
      throw new IllegalStateException(
          "AI_API_KEY is not configured. Set it to enable AI generation.");
    }

    Map<String, Object> payload = Map.of(
        "model", model,
        "messages", List.of(
            Map.of("role", "system", "content", buildSystemPrompt()),
            Map.of("role", "user", "content", buildUserPrompt(input))),
        "response_format", Map.of("type", "json_object"),
        "temperature", 0.7,
        "max_tokens", 4096);

    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(baseUrl + "/chat/completions"))
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer " + apiKey)
        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
        .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    if (response.statusCode() < 200 || response.statusCode() >= 300) {
      String body = response.body() == null ? "" : response.body();
      throw new IllegalStateException(
          "AI API returned " + response.statusCode()
              + (body.isBlank() ? "" : ": " + body.substring(0, Math.min(500, body.length()))));
    }

    JsonNode data = objectMapper.readTree(response.body());
    JsonNode contentNode = data.at("/choices/0/message/content");
    if (contentNode.isMissingNode() || !contentNode.isTextual() || contentNode.asText().isBlank()) {
      throw new IllegalStateException("AI API response missing content");
    }

    JsonNode parsed = parseContentJson(contentNode.asText());
    GenerationResult output = validateShape(parsed);

    return new GenerationResult(
        applyFallbackIds(applyFallbackTitles(output.previewSections(), input.mode()), input.mode()),
        applyFallbackIds(applyFallbackTitles(output.fullSections(), input.mode()), input.mode()));
  }

  private JsonNode parseContentJson(String content) throws IOException {
    try {
      return objectMapper.readTree(content);
    } catch (IOException firstError) {
      Matcher matcher = FENCED_JSON_PATTERN.matcher(content);
      if (matcher.find()) {
        return objectMapper.readTree(matcher.group(1).trim());
      }
      throw new IllegalStateException("AI response content is not valid JSON", firstError);
    }
  }

  private GenerationResult validateShape(JsonNode raw) {
    if (raw == null || !raw.isObject()) {
      throw new IllegalStateException("AI response is not a JSON object");
    }

    JsonNode previewSections = raw.get("previewSections");
    if (previewSections == null || !previewSections.isArray()) {
      throw new IllegalStateException("AI response missing previewSections array");
    }

    JsonNode fullSections = raw.get("fullSections");
    if (fullSections == null || !fullSections.isArray()) {
      throw new IllegalStateException("AI response missing fullSections array");
    }

    if (fullSections.size() < 2) {
      throw new IllegalStateException(
          "AI response fullSections has only " + fullSections.size()
              + " sections (expected at least 2)");
    }

    JsonNode meta = raw.get("meta");
    if (meta == null || !meta.isObject()) {
      throw new IllegalStateException("AI response missing meta object");
    }

    for (String key : List.of("audience", "date", "venue", "budget")) {
      JsonNode value = meta.get(key);
      if (value == null || !value.isTextual()) {
        throw new IllegalStateException("AI response meta." + key + " is missing or not a string");
      }
    }

    return new GenerationResult(normalizeSections(previewSections), normalizeSections(fullSections));
  }

  private List<ResultSectionDto> normalizeSections(JsonNode sections) {
    List<ResultSectionDto> normalized = new ArrayList<>();
    for (JsonNode section : sections) {
      List<String> items = new ArrayList<>();
      JsonNode itemNodes = section.get("items");
      if (itemNodes != null && itemNodes.isArray()) {
        for (JsonNode item : itemNodes) {
          if (item.isTextual()) {
            items.add(item.asText());
          }
        }
      }

      normalized.add(new ResultSectionDto(
          textOrEmpty(section.get("id")),
          textOrEmpty(section.get("title")),
          textOrEmpty(section.get("summary")),
          items));
    }
    return normalized;
  }

  private List<ResultSectionDto> applyFallbackTitles(
      List<ResultSectionDto> sections,
      String mode) {
    List<String> expected = EXPECTED_SECTION_TITLES.get(mode);
    List<ResultSectionDto> patched = new ArrayList<>();
    for (int i = 0; i < sections.size(); i++) {
      ResultSectionDto section = sections.get(i);
      String title = section.title();
      if (title == null || title.isBlank()) {
        title = expected != null && i < expected.size() ? expected.get(i) : "第 " + (i + 1) + " 部分";
      }
      patched.add(new ResultSectionDto(
          section.id(),
          title,
          section.summary(),
          section.items()));
    }
    return patched;
  }

  private List<ResultSectionDto> applyFallbackIds(
      List<ResultSectionDto> sections,
      String mode) {
    List<String> expected = EXPECTED_SECTION_IDS.get(mode);
    List<ResultSectionDto> patched = new ArrayList<>();
    for (int i = 0; i < sections.size(); i++) {
      ResultSectionDto section = sections.get(i);
      String id = section.id();
      if (id == null || id.isBlank()) {
        id = expected != null && i < expected.size() ? expected.get(i) : "section-" + i;
      }
      patched.add(new ResultSectionDto(
          id,
          section.title(),
          section.summary(),
          section.items()));
    }
    return patched;
  }

  private void saveTaskGenerationResult(String taskId, GenerationResult result) {
    taskManager.saveTaskGenerationResult(taskId, result);
  }

  private void setTaskError(String taskId) {
    taskManager.setTaskError(taskId);
  }

  private String buildSystemPrompt() {
    return """
        你是一个活动流程助手，专门帮助中国的大学生社团、学生组织和小型团队生成活动文档。你的角色是活动秘书和流程顾问——实用、清楚、不啰嗦、不写广告文案、不说空洞的套话。

        ## 输出格式

        你必须返回一个严格的 JSON 对象，格式如下：

        {
          "previewSections": [
            {
              "title": "活动概览",
              "summary": "一段 2-3 句话概述这个活动",
              "items": ["要点 1", "要点 2", "要点 3"]
            }
          ],
          "fullSections": [
            {
              "title": "活动概览",
              "summary": "一段 2-3 句话概述这个活动",
              "items": ["要点 1", "要点 2", "要点 3"]
            },
            {
              "title": "时间线 Checklist",
              "summary": "按周或按阶段的筹备时间线说明",
              "items": ["第 8 周：……", "第 6 周：……", "第 4 周：……", "第 2 周：……"]
            },
            {
              "title": "预算项目清单",
              "summary": "预算整体说明",
              "items": ["场地及设备：¥……", "宣传物料：¥……", "……"]
            },
            {
              "title": "人员分工建议",
              "summary": "分工说明",
              "items": ["活动总负责人：……", "宣传组：……", "物资组：……", "接待组：……"]
            },
            {
              "title": "活动当天流程",
              "summary": "活动日执行说明",
              "items": ["12:00 — ……", "13:30 — ……", "14:00 — ……"]
            },
            {
              "title": "活动前 48 小时检查清单",
              "summary": "最后确认事项说明",
              "items": ["与场地确认……", "打印签到表……", "检查设备……"]
            }
          ],
          "meta": {
            "audience": "面向对象（如未提供则为「待确认」）",
            "date": "活动时间（如未提供则为「待确认」）",
            "venue": "活动地点（如未提供则为「待确认」）",
            "budget": "预算范围（如未提供则为「待确认」）"
          }
        }

        ## 内容规则

        - previewSections 只包含「活动概览」一个 section。
        - fullSections 包含全部 6 个 section，按上述顺序排列。
        - 每个 section 的 items 数组至少包含 3 条具体、可执行的内容。
        - 不要编造用户没有提供的信息。如果某个信息缺失，在对应字段填写「待确认」或在 items 中添加「需补充：……」条目。
        - 如果用户粘贴了已有资料，优先参考其中的信息。
        - 金额使用人民币 ¥ 标注。
        - 所有内容使用简体中文。

        ## 语气

        - 像活动秘书或流程顾问，不像广告文案或通用 AI 聊天机器人。
        - 实用、具体、可执行。
        - 不要说「您可以通过以下方式……」或「希望这份方案能帮助您……」之类的套话。
        - 不要加免责声明或「以上内容由 AI 生成」标识。""";
  }

  private String buildUserPrompt(ValidatedTaskInput input) {
    List<String> lines = new ArrayList<>();
    lines.add("请为以下活动生成一份「" + MODE_LABELS.get(input.mode()) + "」。");
    lines.add("");
    lines.add(MODE_INSTRUCTIONS.get(input.mode()));
    lines.add("");
    lines.add("## 活动信息");
    lines.add("");
    lines.add("- 活动名称：" + input.activityName());
    lines.add("- 组织名称：" + input.organizationName());

    if (input.activityType() != null) lines.add("- 活动类型：" + input.activityType());
    if (input.expectedParticipants() != null) lines.add("- 预计人数：" + input.expectedParticipants());
    if (input.dateOrPeriod() != null) lines.add("- 时间周期：" + input.dateOrPeriod());
    if (input.location() != null) lines.add("- 地点：" + input.location());
    if (input.budgetRange() != null) lines.add("- 预算范围：" + input.budgetRange());
    if (input.targetAudience() != null) lines.add("- 面向对象：" + input.targetAudience());

    if (input.extraContext() != null) {
      lines.add("");
      lines.add("## 补充背景");
      lines.add("");
      lines.add(input.extraContext());
    }

    String pasted = truncate(input.pastedMaterials(), MAX_PASTED_MATERIALS_LENGTH);
    if (pasted != null && !pasted.isBlank()) {
      lines.add("");
      lines.add("## 已有资料（供参考）");
      lines.add("");
      lines.add(pasted);
    }

    lines.add("");
    lines.add("请直接返回 JSON，不要包含任何解释文字。");
    return String.join("\n", lines);
  }

  private String truncate(String text, int maxLength) {
    if (text == null || text.length() <= maxLength) return text;
    return text.substring(0, maxLength) + "\n\n…（内容过长，已截断前 " + maxLength + " 个字符）";
  }

  private String textOrEmpty(JsonNode node) {
    return node != null && node.isTextual() ? node.asText() : "";
  }

  private String trimTrailingSlash(String value) {
    if (value == null || value.isBlank()) return "https://api.openai.com/v1";
    String trimmed = value.trim();
    while (trimmed.endsWith("/")) {
      trimmed = trimmed.substring(0, trimmed.length() - 1);
    }
    return trimmed;
  }
}
