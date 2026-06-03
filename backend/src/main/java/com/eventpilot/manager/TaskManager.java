package com.eventpilot.manager;

import com.eventpilot.dto.CreateTaskRequest;
import com.eventpilot.dto.GenerationResult;
import com.eventpilot.dto.TaskPublicResponse;
import com.eventpilot.entity.TaskEntity;
import com.eventpilot.repository.TaskRepository;
import com.eventpilot.service.ApiException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TaskManager {

  public static final String STATUS_GENERATING = "generating";
  public static final String STATUS_READY = "ready";
  public static final String STATUS_ERROR = "error";

  private static final Set<String> VALID_MODES = Set.of("startup", "review", "handoff");
  private static final int MAX_PASTED_MATERIALS = 20_000;
  private static final DateTimeFormatter JS_ISO_FORMATTER =
      new DateTimeFormatterBuilder().appendInstant(3).toFormatter();

  private final TaskRepository taskRepository;
  private final IdGenerator idGenerator;

  public TaskManager(TaskRepository taskRepository, IdGenerator idGenerator) {
    this.taskRepository = taskRepository;
    this.idGenerator = idGenerator;
  }

  public ValidatedTaskInput validate(CreateTaskRequest request) {
    if (request == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "请求体不能为空", null);
    }

    String activityName = trimToNull(request.getActivityName());
    if (activityName == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "活动名称不能为空", null);
    }

    String organizationName = trimToNull(request.getOrganizationName());
    if (organizationName == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "组织名称不能为空", null);
    }

    String mode = trimToNull(request.getMode());
    if (mode == null || !VALID_MODES.contains(mode)) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "生成模式必须是 startup、review 或 handoff",
          null);
    }

    return new ValidatedTaskInput(
        mode,
        activityName,
        organizationName,
        trimToNull(request.getActivityType()),
        parseExpectedParticipants(request.getExpectedParticipants()),
        trimToNull(request.getDateOrPeriod()),
        trimToNull(request.getLocation()),
        trimToNull(request.getBudgetRange()),
        trimToNull(request.getTargetAudience()),
        trimToNull(request.getExtraContext()),
        truncate(trimToNull(request.getPastedMaterials()), MAX_PASTED_MATERIALS));
  }

  public TaskEntity createTask(ValidatedTaskInput input) {
    OffsetDateTime now = OffsetDateTime.now();

    TaskEntity task = new TaskEntity();
    task.setId(idGenerator.nanoid(8));
    task.setMode(input.mode());
    task.setActivityName(input.activityName());
    task.setOrganizationName(input.organizationName());
    task.setActivityType(input.activityType());
    task.setExpectedParticipants(input.expectedParticipants());
    task.setDateOrPeriod(input.dateOrPeriod());
    task.setLocation(input.location());
    task.setBudgetRange(input.budgetRange());
    task.setTargetAudience(input.targetAudience());
    task.setExtraContext(input.extraContext());
    task.setPastedMaterials(input.pastedMaterials());
    task.setStatus(STATUS_GENERATING);
    task.setUnlocked(false);
    task.setCreatedAt(now);
    task.setUpdatedAt(now);

    return taskRepository.save(task);
  }

  public TaskEntity getTaskOrThrow(String id) {
    return taskRepository.findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "任务不存在或链接已失效"));
  }

  @Transactional
  public void saveTaskGenerationResult(String id, GenerationResult result) {
    TaskEntity task = getTaskOrThrow(id);
    task.setPreviewOutput(result.previewSections());
    task.setFullOutput(result.fullSections());
    task.setStatus(STATUS_READY);
    task.setUpdatedAt(OffsetDateTime.now());
    taskRepository.save(task);
  }

  @Transactional
  public void setTaskError(String id) {
    taskRepository.findById(id).ifPresent(task -> {
      task.setStatus(STATUS_ERROR);
      task.setUpdatedAt(OffsetDateTime.now());
      taskRepository.save(task);
    });
  }

  public TaskPublicResponse toPublic(TaskEntity task) {
    return new TaskPublicResponse(
        task.getId(),
        task.getMode(),
        task.getActivityName(),
        task.getOrganizationName(),
        task.getActivityType(),
        task.getExpectedParticipants(),
        task.getDateOrPeriod(),
        task.getLocation(),
        task.getBudgetRange(),
        task.getTargetAudience(),
        task.getExtraContext(),
        task.getPastedMaterials(),
        task.getStatus(),
        task.getPreviewOutput(),
        task.isUnlocked() ? task.getFullOutput() : null,
        task.isUnlocked(),
        toJavaScriptIsoString(task.getCreatedAt()),
        toJavaScriptIsoString(task.getUpdatedAt()));
  }

  private Integer parseExpectedParticipants(Object value) {
    if (value == null) return null;

    if (value instanceof Number number) {
      int parsed = number.intValue();
      return parsed > 0 ? parsed : null;
    }

    String text = value.toString().trim();
    if (text.isEmpty()) return null;

    try {
      int parsed = (int) Math.floor(Double.parseDouble(text));
      return parsed > 0 ? parsed : null;
    } catch (NumberFormatException ignored) {
      return null;
    }
  }

  private String truncate(String text, int maxLength) {
    if (text == null || text.length() <= maxLength) return text;
    return text.substring(0, maxLength);
  }

  private String trimToNull(String value) {
    if (value == null) return null;
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private String toJavaScriptIsoString(OffsetDateTime value) {
    if (value == null) return null;
    Instant instant = value.toInstant().truncatedTo(ChronoUnit.MILLIS);
    return JS_ISO_FORMATTER.format(instant);
  }
}
