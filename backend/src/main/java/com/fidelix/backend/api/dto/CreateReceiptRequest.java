package com.fidelix.backend.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class CreateReceiptRequest {

  // Customer
  @NotBlank public String customerName;
  @NotBlank public String customerPhone;
  @NotBlank public String customerAddress;
  public String customerPanVat; // optional

  // Receiver
  @NotBlank public String receiverName;
  @NotBlank public String receiverPhone;
  @NotBlank public String receiverAddress;
  @NotBlank public String receiverCityCountry;
  @NotBlank public String receiverPostalCode;
  public String receiverEmail;

  // Shipment
  @NotBlank public String shipmentType; // DOCUMENT/PARCEL/CARGO
  public String serviceType;            // AIR/SURFACE/EXPRESS/ECONOMY
  public BigDecimal weightKg;
  @NotNull public Integer pieces;
  public String notes;

  // Billing
  @NotBlank public String paymentMode;   // CASH/BANK/ONLINE
  @NotBlank public String paymentStatus; // PAID/DUE
  @NotBlank public String issuedBy;

  @NotNull @Size(min=1)
  public List<Item> items;

  public BigDecimal discount = BigDecimal.ZERO;

  public static class Item {
    @NotBlank public String description;
    @NotNull public BigDecimal qty;   // decimal allowed
    @NotNull public BigDecimal rate;  // decimal allowed
  }
}
