package com.fidelix.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name="receipts")
public class Receipt {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="receipt_no", nullable=false, unique=true)
  private String receiptNo;

  @Column(name="receipt_yyyymm", nullable=false, length=6)
  private String receiptYyyymm;

  @Column(name="receipt_seq", nullable=false)
  private Integer receiptSeq;

  @Column(name="receipt_date", nullable=false)
  private OffsetDateTime receiptDate;

  @Column(nullable=false)
  private String currency;

  @Column(name="payment_mode", nullable=false)
  private String paymentMode;

  @Column(name="payment_status", nullable=false)
  private String paymentStatus;

  @Column(nullable=false)
  private BigDecimal subtotal;

  @Column(nullable=false)
  private BigDecimal discount;

  @Column(name="grand_total", nullable=false)
  private BigDecimal grandTotal;

  @Column(name="due_amount", nullable=false)
  private BigDecimal dueAmount;

  @Column(name="issued_by", nullable=false)
  private String issuedBy;

  @ManyToOne(optional=false)
  @JoinColumn(name="customer_id")
  private Customer customer;

  public Long getId() { return id; }
  public String getReceiptNo() { return receiptNo; }
  public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }
  public String getReceiptYyyymm() { return receiptYyyymm; }
  public void setReceiptYyyymm(String receiptYyyymm) { this.receiptYyyymm = receiptYyyymm; }
  public Integer getReceiptSeq() { return receiptSeq; }
  public void setReceiptSeq(Integer receiptSeq) { this.receiptSeq = receiptSeq; }
  public OffsetDateTime getReceiptDate() { return receiptDate; }
  public void setReceiptDate(OffsetDateTime receiptDate) { this.receiptDate = receiptDate; }
  public String getCurrency() { return currency; }
  public void setCurrency(String currency) { this.currency = currency; }
  public String getPaymentMode() { return paymentMode; }
  public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
  public String getPaymentStatus() { return paymentStatus; }
  public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
  public BigDecimal getSubtotal() { return subtotal; }
  public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
  public BigDecimal getDiscount() { return discount; }
  public void setDiscount(BigDecimal discount) { this.discount = discount; }
  public BigDecimal getGrandTotal() { return grandTotal; }
  public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
  public BigDecimal getDueAmount() { return dueAmount; }
  public void setDueAmount(BigDecimal dueAmount) { this.dueAmount = dueAmount; }
  public String getIssuedBy() { return issuedBy; }
  public void setIssuedBy(String issuedBy) { this.issuedBy = issuedBy; }
  public Customer getCustomer() { return customer; }
  public void setCustomer(Customer customer) { this.customer = customer; }
}
