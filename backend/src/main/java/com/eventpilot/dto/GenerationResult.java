package com.eventpilot.dto;

import java.util.List;

public record GenerationResult(
    List<ResultSectionDto> previewSections,
    List<ResultSectionDto> fullSections) {}
