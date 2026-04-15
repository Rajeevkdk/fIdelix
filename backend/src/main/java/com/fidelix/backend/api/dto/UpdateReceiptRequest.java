package com.fidelix.backend.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class UpdateReceiptRequest {

  @NotBlank public String customerName;
  @NotBlank public String customerPhone;
  @NotBlank public String customerAddress;
  public String customerPanVat;

  @NotBlank public String receiverName;
  @NotBlank public String receiverPhone;
  @NotBlank public String receiverAddress;
  @NotBlank public String receiverCityCountry;
  @NotBlank public String receiverPostalCode;
  public String receiverEmail;

  @NotBlank public String shipmentType;
  public String serviceType;
  public BigDecimal weightKg;
  @NotNull public Integer pieces;
  public String notes;

  public String forwardingTrackingNo;
  public String forwardingTrackingUrl;

  @NotBlank public String paymentMode;
  @NotBlank public String paymentStatus;
  @NotBlank public String issuedBy;

  @NotNull @Size(min = 1)
  public List<Item> items;

  public BigDecimal discount = BigDecimal.ZERO;

  public static class Item {
    @NotBlank public String description;
    @NotNull public BigDecimal qty;
    @NotNull public BigDecimal rate;
  }
}