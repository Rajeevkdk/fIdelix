package com.fidelix.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "monthly_counters")
public class MonthlyCounter {

  @Id
  @Column(name = "key", length = 40)
  private String key;

  @Column(name = "current_value", nullable = false)
  private Integer currentValue;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  public String getKey() { return key; }
  public void setKey(String key) { this.key = key; }

  public Integer getCurrentValue() { return currentValue; }
  public void setCurrentValue(Integer currentValue) { this.currentValue = currentValue; }

  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
