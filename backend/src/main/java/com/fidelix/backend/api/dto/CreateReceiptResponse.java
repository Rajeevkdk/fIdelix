package com.fidelix.backend.api.dto;

public class CreateReceiptResponse {
  public String receiptNo;
  public String trackingNo;

  public CreateReceiptResponse(String receiptNo, String trackingNo) {
    this.receiptNo = receiptNo;
    this.trackingNo = trackingNo;
  }
}
