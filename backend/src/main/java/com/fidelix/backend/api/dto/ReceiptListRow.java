package com.fidelix.backend.api.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ReceiptListRow {
  public String receiptNo;
  public String trackingNo;
  public String customerName;
  public String customerPhone;
  public BigDecimal total;
  public String paymentStatus;
  public String issuedBy;
  public OffsetDateTime receiptDate;

  public ReceiptListRow(String receiptNo, String trackingNo, String customerName, String customerPhone,
                        BigDecimal total, String paymentStatus, String issuedBy, OffsetDateTime receiptDate) {
    this.receiptNo = receiptNo;
    this.trackingNo = trackingNo;
    this.customerName = customerName;
    this.customerPhone = customerPhone;
    this.total = total;
    this.paymentStatus = paymentStatus;
    this.issuedBy = issuedBy;
    this.receiptDate = receiptDate;
  }
}