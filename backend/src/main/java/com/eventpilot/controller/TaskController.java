package com.eventpilot.controller;

import com.eventpilot.dto.CreateTaskRequest;
import com.eventpilot.dto.CreateTaskResponse;
import com.eventpilot.dto.RedeemRequest;
import com.eventpilot.dto.TaskPublicResponse;
import com.eventpilot.entity.TaskEntity;
import com.eventpilot.service.ApiException;
import com.eventpilot.service.RedeemCodeService;
import com.eventpilot.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

  private final TaskService taskService;
  private final RedeemCodeService redeemCodeService;

  public TaskController(TaskService taskService, RedeemCodeService redeemCodeService) {
    this.taskService = taskService;
    this.redeemCodeService = redeemCodeService;
  }

  @PostMapping
  public ResponseEntity<CreateTaskResponse> createTask(@RequestBody CreateTaskRequest request) {
    TaskEntity task = taskService.createTask(request);
    return ResponseEntity
        .status(HttpStatus.ACCEPTED)
        .body(new CreateTaskResponse(task.getId(), TaskService.STATUS_GENERATING));
  }

  @GetMapping("/{id}")
  public TaskPublicResponse getTask(@PathVariable String id) {
    return taskService.toPublic(taskService.getTaskOrThrow(id));
  }

  @PostMapping("/{id}/redeem")
  public TaskPublicResponse redeemTask(
      @PathVariable String id,
      @RequestBody RedeemRequest request) {
    if (request == null || request.code() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "请提供兑换码");
    }

    TaskEntity unlockedTask = redeemCodeService.redeemCodeAndUnlockTask(request.code(), id);
    return taskService.toPublic(unlockedTask);
  }
}
