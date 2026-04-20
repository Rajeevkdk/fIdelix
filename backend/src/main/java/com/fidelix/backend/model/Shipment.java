package com.fidelix.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name="shipments")
public class Shipment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="tracking_no", nullable=false, unique=true)
  private String trackingNo;

  @Column(name="tracking_yyyymm", nullable=false, length=6)
  private String trackingYyyymm;

  @Column(name="tracking_seq", nullable=false)
  private Integer trackingSeq;

  @Column(name="created_at", nullable=false)
  private OffsetDateTime createdAt;

  @OneToOne(optional=false)
  @JoinColumn(name="receipt_id")
  private Receipt receipt;

  @Column(name="shipment_type", nullable=false)
  private String shipmentType;

  @Column(name="service_type")
  private String serviceType;

  @Column(name="weight_kg", precision=12, scale=3)
  private BigDecimal weightKg;

  @Column(nullable=false)
  private Integer pieces;

  private String notes;

  @Column(name="receiver_name", nullable=false)
  private String receiverName;

  @Column(name="receiver_phone", nullable=false)
  private String receiverPhone;

  @Column(name="receiver_address", nullable=false)
  private String receiverAddress;

  @Column(name="receiver_city_country", nullable=false)
  private String receiverCityCountry;

  @Column(name="receiver_postal_code", nullable=false)
  private String receiverPostalCode;

  @Column(name="receiver_email")
  private String receiverEmail;

  @Column(name="forwarding_tracking_no")
  private String forwardingTrackingNo;

  @Column(name="forwarding_tracking_url")
  private String forwardingTrackingUrl;

  public Long getId() { return id; }
  public String getTrackingNo() { return trackingNo; }
  public void setTrackingNo(String trackingNo) { this.trackingNo = trackingNo; }
  public String getTrackingYyyymm() { return trackingYyyymm; }
  public void setTrackingYyyymm(String trackingYyyymm) { this.trackingYyyymm = trackingYyyymm; }
  public Integer getTrackingSeq() { return trackingSeq; }
  public void setTrackingSeq(Integer trackingSeq) { this.trackingSeq = trackingSeq; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
  public Receipt getReceipt() { return receipt; }
  public void setReceipt(Receipt receipt) { this.receipt = receipt; }
  public String getShipmentType() { return shipmentType; }
  public void setShipmentType(String shipmentType) { this.shipmentType = shipmentType; }
  public String getServiceType() { return serviceType; }
  public void setServiceType(String serviceType) { this.serviceType = serviceType; }
  public BigDecimal getWeightKg() { return weightKg; }
  public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
  public Integer getPieces() { return pieces; }
  public void setPieces(Integer pieces) { this.pieces = pieces; }
  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
  public String getReceiverName() { return receiverName; }
  public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
  public String getReceiverPhone() { return receiverPhone; }
  public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
  public String getReceiverAddress() { return receiverAddress; }
  public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
  public String getReceiverCityCountry() { return receiverCityCountry; }
  public void setReceiverCityCountry(String receiverCityCountry) { this.receiverCityCountry = receiverCityCountry; }
  public String getReceiverPostalCode() { return receiverPostalCode; }
  public void setReceiverPostalCode(String receiverPostalCode) { this.receiverPostalCode = receiverPostalCode; }
  public String getReceiverEmail() { return receiverEmail; }
  public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }
  public String getForwardingTrackingNo() { return forwardingTrackingNo; }
  public void setForwardingTrackingNo(String forwardingTrackingNo) { this.forwardingTrackingNo = forwardingTrackingNo; }
  public String getForwardingTrackingUrl() { return forwardingTrackingUrl; }
  public void setForwardingTrackingUrl(String forwardingTrackingUrl) { this.forwardingTrackingUrl = forwardingTrackingUrl; }
}