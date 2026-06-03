package com.eventpilot.entity;

import com.eventpilot.dto.ResultSectionDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "tasks")
public class TaskEntity {

  @Id
  @Column(name = "id", nullable = false, length = 32)
  private String id;

  @Column(name = "mode", nullable = false)
  private String mode;

  @Column(name = "activity_name", nullable = false)
  private String activityName;

  @Column(name = "organization_name", nullable = false)
  private String organizationName;

  @Column(name = "activity_type")
  private String activityType;

  @Column(name = "expected_participants")
  private Integer expectedParticipants;

  @Column(name = "date_or_period")
  private String dateOrPeriod;

  @Column(name = "location")
  private String location;

  @Column(name = "budget_range")
  private String budgetRange;

  @Column(name = "target_audience")
  private String targetAudience;

  @Column(name = "extra_context", columnDefinition = "text")
  private String extraContext;

  @Column(name = "pasted_materials", columnDefinition = "text")
  private String pastedMaterials;

  @Column(name = "status", nullable = false)
  private String status;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "preview_output", columnDefinition = "jsonb")
  private List<ResultSectionDto> previewOutput;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "full_output", columnDefinition = "jsonb")
  private List<ResultSectionDto> fullOutput;

  @Column(name = "unlocked", nullable = false)
  private boolean unlocked;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

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

  public Integer getExpectedParticipants() {
    return expectedParticipants;
  }

  public void setExpectedParticipants(Integer expectedParticipants) {
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

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public List<ResultSectionDto> getPreviewOutput() {
    return previewOutput;
  }

  public void setPreviewOutput(List<ResultSectionDto> previewOutput) {
    this.previewOutput = previewOutput;
  }

  public List<ResultSectionDto> getFullOutput() {
    return fullOutput;
  }

  public void setFullOutput(List<ResultSectionDto> fullOutput) {
    this.fullOutput = fullOutput;
  }

  public boolean isUnlocked() {
    return unlocked;
  }

  public void setUnlocked(boolean unlocked) {
    this.unlocked = unlocked;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
