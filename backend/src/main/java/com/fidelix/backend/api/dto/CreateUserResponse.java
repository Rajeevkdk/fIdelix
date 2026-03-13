package com.fidelix.backend.api.dto;

public class CreateUserResponse {
  public Long id;
  public String username;
  public String fullName;
  public String role;
  public boolean isActive;

  public CreateUserResponse(Long id, String username, String fullName, String role, boolean isActive) {
    this.id = id;
    this.username = username;
    this.fullName = fullName;
    this.role = role;
    this.isActive = isActive;
  }
}