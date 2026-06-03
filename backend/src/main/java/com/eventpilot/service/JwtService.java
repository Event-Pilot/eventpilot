package com.eventpilot.service;

import com.eventpilot.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final String jwtSecret;
  private final long jwtExpirationSeconds;

  public JwtService(
      @Value("${eventpilot.auth.jwt-secret}") String jwtSecret,
      @Value("${eventpilot.auth.jwt-expiration-seconds}") long jwtExpirationSeconds) {
    this.jwtSecret = jwtSecret;
    this.jwtExpirationSeconds = jwtExpirationSeconds;
  }

  public String generateToken(UserEntity user) {
    Instant now = Instant.now();
    Instant expiresAt = now.plusSeconds(jwtExpirationSeconds);

    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("email", user.getEmail())
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiresAt))
        .signWith(signingKey(), Jwts.SIG.HS256)
        .compact();
  }

  public Long parseUserId(String token) {
    Claims claims = Jwts.parser()
        .verifyWith(signingKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();

    return Long.valueOf(claims.getSubject());
  }

  private SecretKey signingKey() {
    byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
      throw new IllegalStateException("JWT_SECRET must be at least 32 bytes for HS256");
    }
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
