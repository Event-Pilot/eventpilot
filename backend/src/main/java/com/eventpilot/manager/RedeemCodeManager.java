package com.eventpilot.manager;

import com.eventpilot.entity.RedeemCodeEntity;
import com.eventpilot.entity.TaskEntity;
import com.eventpilot.repository.RedeemCodeRepository;
import com.eventpilot.repository.TaskRepository;
import com.eventpilot.service.ApiException;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class RedeemCodeManager {

  private final RedeemCodeRepository redeemCodeRepository;
  private final TaskRepository taskRepository;

  public RedeemCodeManager(
      RedeemCodeRepository redeemCodeRepository,
      TaskRepository taskRepository) {
    this.redeemCodeRepository = redeemCodeRepository;
    this.taskRepository = taskRepository;
  }

  public TaskEntity redeemCodeAndUnlockTask(String rawCode, String taskId) {
    if (trimToNull(rawCode) == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "兑换码不能为空");
    }

    TaskEntity task = taskRepository.findById(taskId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "not_found", "任务不存在或链接已失效"));

    String code = normalizeCode(rawCode);
    RedeemCodeEntity redeemCode = redeemCodeRepository.findByCodeForUpdate(code)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "invalid_code", "兑换码无效，请检查后重试。"));

    if (redeemCode.getTaskId() != null) {
      throw new ApiException(HttpStatus.CONFLICT, "code_already_used", "该兑换码已被使用。");
    }

    OffsetDateTime now = OffsetDateTime.now();
    redeemCode.setTaskId(taskId);
    redeemCode.setUsedAt(now);
    redeemCodeRepository.save(redeemCode);

    task.setUnlocked(true);
    task.setUpdatedAt(now);
    return taskRepository.save(task);
  }

  private String normalizeCode(String input) {
    return input.trim().toUpperCase();
  }

  private String trimToNull(String value) {
    if (value == null) return null;
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
