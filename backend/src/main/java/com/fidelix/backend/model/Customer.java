package com.fidelix.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "customers")
public class Customer {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="full_name", nullable=false)
  private String fullName;

  @Column(nullable=false)
  private String phone;

  @Column(nullable=false)
  private String address;

  @Column(name="pan_vat")
  private String panVat;

  @Column(name="created_at", nullable=false)
  private OffsetDateTime createdAt;

  public Long getId() { return id; }
  public String getFullName() { return fullName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public String getPanVat() { return panVat; }
  public void setPanVat(String panVat) { this.panVat = panVat; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
