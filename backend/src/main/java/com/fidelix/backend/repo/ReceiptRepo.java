package com.fidelix.backend.repo;

import com.fidelix.backend.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ReceiptRepo extends JpaRepository<Receipt, Long> {

  Optional<Receipt> findByReceiptNo(String receiptNo);

  List<Receipt> findByReceiptDateBetweenOrderByIdDesc(OffsetDateTime fromDt, OffsetDateTime toDt);
}