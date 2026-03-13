package com.fidelix.backend.api.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class PublicTrackingResponse {
  public String trackingNo;
  public String shipmentType;
  public String serviceType;
  public String receiverName;
  public String receiverCityCountry;
  public String status;

  // new fields for external/official tracking
  public String forwardingTrackingNo;
  public String forwardingTrackingUrl;

  public List<Event> events;

  public static class Event {
    public String status;
    public String location;
    public String remarks;
    public OffsetDateTime eventTime;

    public Event(String status, String location, String remarks, OffsetDateTime eventTime) {
      this.status = status;
      this.location = location;
      this.remarks = remarks;
      this.eventTime = eventTime;
    }
  }
}