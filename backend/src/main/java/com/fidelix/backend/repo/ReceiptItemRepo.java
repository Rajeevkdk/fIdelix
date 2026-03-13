package com.fidelix.backend.repo;

import com.fidelix.backend.model.ReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptItemRepo extends JpaRepository<ReceiptItem, Long> {}
