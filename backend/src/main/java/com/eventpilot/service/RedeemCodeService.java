package com.eventpilot.service;

import com.eventpilot.entity.TaskEntity;
import com.eventpilot.manager.RedeemCodeManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RedeemCodeService {

  private final RedeemCodeManager redeemCodeManager;

  public RedeemCodeService(RedeemCodeManager redeemCodeManager) {
    this.redeemCodeManager = redeemCodeManager;
  }

  @Transactional
  public TaskEntity redeemCodeAndUnlockTask(String rawCode, String taskId) {
    return redeemCodeManager.redeemCodeAndUnlockTask(rawCode, taskId);
  }
}
