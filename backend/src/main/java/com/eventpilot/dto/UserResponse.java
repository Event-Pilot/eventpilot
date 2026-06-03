package com.eventpilot.dto;

public record UserResponse(
    Long id,
    String email,
    String name,
    String createdAt,
    String updatedAt) {}
