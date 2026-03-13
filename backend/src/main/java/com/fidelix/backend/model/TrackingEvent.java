package com.fidelix.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name="tracking_events")
public class TrackingEvent {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional=false)
  @JoinColumn(name="shipment_id")
  private Shipment shipment;

  @Column(nullable=false)
  private String status;

  private String location;
  private String note;

  @Column(name="event_time", nullable=false)
  private OffsetDateTime eventTime;

  @Column(name="updated_by", nullable=false)
  private String updatedBy;

  public Long getId() { return id; }
  public Shipment getShipment() { return shipment; }
  public void setShipment(Shipment shipment) { this.shipment = shipment; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getLocation() { return location; }
  public void setLocation(String location) { this.location = location; }
  public String getNote() { return note; }
  public void setNote(String note) { this.note = note; }
  public OffsetDateTime getEventTime() { return eventTime; }
  public void setEventTime(OffsetDateTime eventTime) { this.eventTime = eventTime; }
  public String getUpdatedBy() { return updatedBy; }
  public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
