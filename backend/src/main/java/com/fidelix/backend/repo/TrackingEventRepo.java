package com.fidelix.backend.repo;

import com.fidelix.backend.model.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingEventRepo extends JpaRepository<TrackingEvent, Long> {
  List<TrackingEvent> findByShipmentIdOrderByEventTimeDesc(Long shipmentId);
}
