package com.fidelix.backend.api.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class ReceiptDetailResponse {
  public String receiptNo;
  public OffsetDateTime receiptDate;
  public String currency;
  public String paymentMode;
  public String paymentStatus;
  public BigDecimal subtotal;
  public BigDecimal discount;
  public BigDecimal grandTotal;
  public BigDecimal dueAmount;
  public String issuedBy;

  public Customer customer;
  public Shipment shipment;
  public List<Item> items;

  public static class Customer {
    public String name;
    public String phone;
    public String address;
    public String panVat;
  }

  public static class Shipment {
    public String trackingNo;
    public String shipmentType;
    public String serviceType;
    public BigDecimal weightKg;
    public Integer pieces;
    public String notes;

    public String receiverName;
    public String receiverPhone;
    public String receiverAddress;
    public String receiverCityCountry;
    public String receiverPostalCode;
    public String receiverEmail;
  }

  public static class Item {
    public Integer sn;
    public String description;
    public BigDecimal qty;
    public BigDecimal rate;
    public BigDecimal amount;
  }
}