package com.eventpilot.repository;

import com.eventpilot.entity.RedeemCodeEntity;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RedeemCodeRepository extends JpaRepository<RedeemCodeEntity, Long> {

  Optional<RedeemCodeEntity> findByCode(String code);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from RedeemCodeEntity r where r.code = :code")
  Optional<RedeemCodeEntity> findByCodeForUpdate(@Param("code") String code);
}
