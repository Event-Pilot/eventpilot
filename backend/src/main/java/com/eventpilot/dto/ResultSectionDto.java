package com.eventpilot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ResultSectionDto(
    String id,
    String title,
    String summary,
    List<String> items) {}
