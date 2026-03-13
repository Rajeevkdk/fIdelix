package com.fidelix.backend.api.dto;

import java.time.OffsetDateTime;

public class UserSummary {
  public Long id;
  public String username;
  public String fullName;
  public String role;
  public boolean isActive;
  public OffsetDateTime createdAt;

  public UserSummary(Long id, String username, String fullName, String role, boolean isActive, OffsetDateTime createdAt) {
    this.id = id;
    this.username = username;
    this.fullName = fullName;
    this.role = role;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
}