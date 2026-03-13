package com.fidelix.backend.service;

import com.fidelix.backend.api.dto.PublicTrackingResponse;
import com.fidelix.backend.model.Shipment;
import com.fidelix.backend.model.TrackingEvent;
import com.fidelix.backend.repo.ShipmentRepo;
import com.fidelix.backend.repo.TrackingEventRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublicTrackingService {

  private final ShipmentRepo shipmentRepo;
  private final TrackingEventRepo trackingEventRepo;

  public PublicTrackingService(ShipmentRepo shipmentRepo, TrackingEventRepo trackingEventRepo) {
    this.shipmentRepo = shipmentRepo;
    this.trackingEventRepo = trackingEventRepo;
  }

  public PublicTrackingResponse track(String trackingNo) {
    Shipment shipment = shipmentRepo.findByTrackingNoIgnoreCase(trackingNo)
        .orElseThrow(() -> new RuntimeException("Tracking number not found"));

    List<TrackingEvent> events = trackingEventRepo.findByShipmentIdOrderByEventTimeDesc(shipment.getId());

    PublicTrackingResponse resp = new PublicTrackingResponse();
    resp.trackingNo = shipment.getTrackingNo();
resp.shipmentType = shipment.getShipmentType();
resp.serviceType = shipment.getServiceType();
resp.receiverName = shipment.getReceiverName();
resp.receiverCityCountry = shipment.getReceiverCityCountry();
resp.status = events.isEmpty() ? "Shipment Created" : events.get(0).getStatus();

// placeholder for now
resp.forwardingTrackingNo = null;
resp.forwardingTrackingUrl = null;

    resp.events = events.stream()
    .map(e -> new PublicTrackingResponse.Event(
        e.getStatus(),
        e.getLocation(),
        null,
        e.getEventTime()
    ))
    .toList();

    return resp;
  }
}