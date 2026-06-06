package com.eventpilot.config;

import com.eventpilot.dto.ErrorResponse;
import com.eventpilot.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final ObjectMapper objectMapper;

  public JwtAuthenticationFilter(JwtService jwtService, ObjectMapper objectMapper) {
    this.jwtService = jwtService;
    this.objectMapper = objectMapper;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = authorizationHeader.substring("Bearer ".length()).trim();
    if (token.isEmpty()) {
      handleInvalidToken(request, response, filterChain);
      return;
    }

    try {
      Long userId = jwtService.parseUserId(token);
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
              String.valueOf(userId),
              null,
              List.of(new SimpleGrantedAuthority("ROLE_USER")));
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
      filterChain.doFilter(request, response);
    } catch (JwtException | IllegalArgumentException | IllegalStateException exception) {
      SecurityContextHolder.clearContext();
      handleInvalidToken(request, response, filterChain);
    }
  }

  private void handleInvalidToken(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws IOException, ServletException {
    if (!requiresValidToken(request)) {
      filterChain.doFilter(request, response);
      return;
    }

    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    objectMapper.writeValue(
        response.getWriter(),
        new ErrorResponse("invalid_token", "登录状态已失效，请重新登录"));
  }

  private boolean requiresValidToken(HttpServletRequest request) {
    String method = request.getMethod();
    String path = request.getRequestURI();
    return ("GET".equalsIgnoreCase(method) && "/api/auth/me".equals(path))
        || ("POST".equalsIgnoreCase(method) && "/api/tasks".equals(path));
  }
}
