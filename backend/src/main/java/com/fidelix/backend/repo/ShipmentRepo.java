package com.fidelix.backend.repo;

import com.fidelix.backend.model.Receipt;
import com.fidelix.backend.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipmentRepo extends JpaRepository<Shipment, Long> {
  Optional<Shipment> findByTrackingNoIgnoreCase(String trackingNo);
  Optional<Shipment> findByReceipt(Receipt receipt);
}