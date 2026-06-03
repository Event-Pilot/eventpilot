package com.eventpilot.repository;

import com.eventpilot.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, String> {}
