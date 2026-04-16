package com.fidelix.backend.repo;

import com.fidelix.backend.model.Receipt;
import com.fidelix.backend.model.ReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptItemRepo extends JpaRepository<ReceiptItem, Long> {
  List<ReceiptItem> findByReceiptOrderBySnAsc(Receipt receipt);
  void deleteByReceipt(Receipt receipt);
}