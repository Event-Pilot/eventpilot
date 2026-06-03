package com.eventpilot.dto;

public class CreateTaskRequest {

  private String mode;
  private String activityName;
  private String organizationName;
  private String activityType;
  private Object expectedParticipants;
  private String dateOrPeriod;
  private String location;
  private String budgetRange;
  private String targetAudience;
  private String extraContext;
  private String pastedMaterials;

  public String getMode() {
    return mode;
  }

  public void setMode(String mode) {
    this.mode = mode;
  }

  public String getActivityName() {
    return activityName;
  }

  public void setActivityName(String activityName) {
    this.activityName = activityName;
  }

  public String getOrganizationName() {
    return organizationName;
  }

  public void setOrganizationName(String organizationName) {
    this.organizationName = organizationName;
  }

  public String getActivityType() {
    return activityType;
  }

  public void setActivityType(String activityType) {
    this.activityType = activityType;
  }

  public Object getExpectedParticipants() {
    return expectedParticipants;
  }

  public void setExpectedParticipants(Object expectedParticipants) {
    this.expectedParticipants = expectedParticipants;
  }

  public String getDateOrPeriod() {
    return dateOrPeriod;
  }

  public void setDateOrPeriod(String dateOrPeriod) {
    this.dateOrPeriod = dateOrPeriod;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getBudgetRange() {
    return budgetRange;
  }

  public void setBudgetRange(String budgetRange) {
    this.budgetRange = budgetRange;
  }

  public String getTargetAudience() {
    return targetAudience;
  }

  public void setTargetAudience(String targetAudience) {
    this.targetAudience = targetAudience;
  }

  public String getExtraContext() {
    return extraContext;
  }

  public void setExtraContext(String extraContext) {
    this.extraContext = extraContext;
  }

  public String getPastedMaterials() {
    return pastedMaterials;
  }

  public void setPastedMaterials(String pastedMaterials) {
    this.pastedMaterials = pastedMaterials;
  }
}
