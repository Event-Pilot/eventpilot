package com.eventpilot.service;

import com.eventpilot.dto.CreateTaskRequest;
import com.eventpilot.dto.TaskPublicResponse;
import com.eventpilot.entity.TaskEntity;
import com.eventpilot.manager.AiGenerationManager;
import com.eventpilot.manager.TaskManager;
import com.eventpilot.manager.ValidatedTaskInput;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class TaskService {

  public static final String STATUS_GENERATING = TaskManager.STATUS_GENERATING;
  public static final String STATUS_READY = TaskManager.STATUS_READY;
  public static final String STATUS_ERROR = TaskManager.STATUS_ERROR;

  private final TaskManager taskManager;
  private final AiGenerationManager aiGenerationManager;

  public TaskService(
      TaskManager taskManager,
      AiGenerationManager aiGenerationManager) {
    this.taskManager = taskManager;
    this.aiGenerationManager = aiGenerationManager;
  }

  @Transactional
  public TaskEntity createTask(CreateTaskRequest request) {
    ValidatedTaskInput input = taskManager.validate(request);
    TaskEntity saved = taskManager.createTask(input);
    startGenerationAfterCommit(saved.getId(), input);
    return saved;
  }

  @Transactional(readOnly = true)
  public TaskEntity getTaskOrThrow(String id) {
    return taskManager.getTaskOrThrow(id);
  }

  public TaskPublicResponse toPublic(TaskEntity task) {
    return taskManager.toPublic(task);
  }

  private void startGenerationAfterCommit(String taskId, ValidatedTaskInput input) {
    if (!TransactionSynchronizationManager.isSynchronizationActive()) {
      aiGenerationManager.generateInBackground(taskId, input);
      return;
    }

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void afterCommit() {
        aiGenerationManager.generateInBackground(taskId, input);
      }
    });
  }
}
