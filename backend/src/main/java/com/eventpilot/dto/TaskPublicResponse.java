package com.eventpilot.dto;

import java.util.List;

public record TaskPublicResponse(
    String id,
    String mode,
    String activityName,
    String organizationName,
    String activityType,
    Integer expectedParticipants,
    String dateOrPeriod,
    String location,
    String budgetRange,
    String targetAudience,
    String extraContext,
    String pastedMaterials,
    String status,
    List<ResultSectionDto> previewOutput,
    List<ResultSectionDto> fullOutput,
    boolean unlocked,
    String createdAt,
    String updatedAt) {}
