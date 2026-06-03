package com.eventpilot.service;

import com.eventpilot.dto.AuthResponse;
import com.eventpilot.dto.LoginRequest;
import com.eventpilot.dto.RegisterRequest;
import com.eventpilot.dto.UserResponse;
import com.eventpilot.entity.UserEntity;
import com.eventpilot.manager.UserManager;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserManager userManager;
  private final JwtService jwtService;

  public AuthService(UserManager userManager, JwtService jwtService) {
    this.userManager = userManager;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    UserEntity user = userManager.register(request);
    return toAuthResponse(user);
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    UserEntity user = userManager.authenticate(request);
    return toAuthResponse(user);
  }

  @Transactional(readOnly = true)
  public UserResponse getCurrentUser(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "unauthorized", "请先登录");
    }

    Long userId;
    try {
      userId = Long.valueOf(authentication.getName());
    } catch (NumberFormatException exception) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid_token", "登录状态已失效，请重新登录");
    }

    return userManager.toResponse(userManager.getUserForToken(userId));
  }

  private AuthResponse toAuthResponse(UserEntity user) {
    return new AuthResponse(jwtService.generateToken(user), userManager.toResponse(user));
  }
}
