package com.eventpilot.config;

import com.eventpilot.dto.ErrorResponse;
import com.eventpilot.service.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ErrorResponse> handleApiException(ApiException exception) {
    return ResponseEntity
        .status(exception.getStatus())
        .body(new ErrorResponse(exception.getError(), exception.getMessage()));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleUnreadableJson(HttpServletRequest request) {
    if (isCreateTask(request)) {
      return ResponseEntity
          .status(HttpStatus.BAD_REQUEST)
          .body(new ErrorResponse("请求体必须是有效的 JSON", null));
    }

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse("invalid_request", "请求体必须是有效的 JSON"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleUnexpectedException(
      Exception exception,
      HttpServletRequest request) {
    System.err.println("[EventPilot] unhandled API error: " + exception.getMessage());

    if (isCreateTask(request)) {
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("创建任务失败，请稍后重试", null));
    }

    if (isRedeemTask(request)) {
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("server_error", "验证失败，请稍后重试"));
    }

    if (isGetTask(request)) {
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("server_error", "读取任务失败，请稍后重试"));
    }

    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponse("server_error", "请求失败，请稍后重试"));
  }

  private boolean isCreateTask(HttpServletRequest request) {
    return "POST".equalsIgnoreCase(request.getMethod())
        && "/api/tasks".equals(request.getRequestURI());
  }

  private boolean isGetTask(HttpServletRequest request) {
    return "GET".equalsIgnoreCase(request.getMethod())
        && request.getRequestURI().matches("^/api/tasks/[^/]+$");
  }

  private boolean isRedeemTask(HttpServletRequest request) {
    return "POST".equalsIgnoreCase(request.getMethod())
        && request.getRequestURI().matches("^/api/tasks/[^/]+/redeem$");
  }
}
