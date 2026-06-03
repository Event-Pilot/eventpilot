package com.eventpilot.manager;

import com.eventpilot.dto.LoginRequest;
import com.eventpilot.dto.RegisterRequest;
import com.eventpilot.dto.UserResponse;
import com.eventpilot.entity.UserEntity;
import com.eventpilot.repository.UserRepository;
import com.eventpilot.service.ApiException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserManager {

  private static final Pattern EMAIL_PATTERN =
      Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
  private static final DateTimeFormatter JS_ISO_FORMATTER =
      new DateTimeFormatterBuilder().appendInstant(3).toFormatter();

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserManager(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public UserEntity register(RegisterRequest request) {
    if (request == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "请求体不能为空");
    }

    String email = normalizeEmail(request.email());
    if (email == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "邮箱不能为空");
    }
    if (!EMAIL_PATTERN.matcher(email).matches()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "邮箱格式不正确");
    }

    String password = request.password();
    if (password == null || password.isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "密码不能为空");
    }

    if (userRepository.existsByEmail(email)) {
      throw new ApiException(HttpStatus.CONFLICT, "user_exists", "邮箱已注册");
    }

    OffsetDateTime now = OffsetDateTime.now();
    UserEntity user = new UserEntity();
    user.setEmail(email);
    user.setName(trimToNull(request.name()));
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setCreatedAt(now);
    user.setUpdatedAt(now);

    try {
      return userRepository.saveAndFlush(user);
    } catch (DataIntegrityViolationException exception) {
      throw new ApiException(HttpStatus.CONFLICT, "user_exists", "邮箱已注册");
    }
  }

  public UserEntity authenticate(LoginRequest request) {
    if (request == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "请求体不能为空");
    }

    String email = normalizeEmail(request.email());
    String password = request.password();

    if (email == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "邮箱不能为空");
    }
    if (password == null || password.isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_request", "密码不能为空");
    }

    return userRepository.findByEmail(email)
        .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()))
        .orElseThrow(() -> new ApiException(
            HttpStatus.UNAUTHORIZED,
            "invalid_credentials",
            "邮箱或密码错误"));
  }

  public UserEntity getUserForToken(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ApiException(
            HttpStatus.UNAUTHORIZED,
            "invalid_token",
            "登录状态已失效，请重新登录"));
  }

  public UserResponse toResponse(UserEntity user) {
    return new UserResponse(
        user.getId(),
        user.getEmail(),
        user.getName(),
        toJavaScriptIsoString(user.getCreatedAt()),
        toJavaScriptIsoString(user.getUpdatedAt()));
  }

  private String normalizeEmail(String email) {
    String trimmed = trimToNull(email);
    return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
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
