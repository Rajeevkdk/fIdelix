package com.fidelix.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="receipt_items")
public class ReceiptItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional=false)
  @JoinColumn(name="receipt_id")
  private Receipt receipt;

  @Column(nullable=false)
  private Integer sn;

  @Column(nullable=false)
  private String description;

  @Column(nullable=false, precision=12, scale=2)
  private BigDecimal qty;

  @Column(nullable=false, precision=12, scale=2)
  private BigDecimal rate;

  @Column(nullable=false, precision=12, scale=2)
  private BigDecimal amount;

  public Long getId() { return id; }
  public Receipt getReceipt() { return receipt; }
  public void setReceipt(Receipt receipt) { this.receipt = receipt; }
  public Integer getSn() { return sn; }
  public void setSn(Integer sn) { this.sn = sn; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public BigDecimal getQty() { return qty; }
  public void setQty(BigDecimal qty) { this.qty = qty; }
  public BigDecimal getRate() { return rate; }
  public void setRate(BigDecimal rate) { this.rate = rate; }
  public BigDecimal getAmount() { return amount; }
  public void setAmount(BigDecimal amount) { this.amount = amount; }
}
