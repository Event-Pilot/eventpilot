package com.eventpilot.manager;

public record ValidatedTaskInput(
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
    String pastedMaterials) {}
