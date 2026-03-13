package com.fidelix.backend.api.dto;

public class LoginResponse {
  public String token;
  public String username;
  public String fullName;
  public String role;

  public LoginResponse(String token, String username, String fullName, String role) {
    this.token = token;
    this.username = username;
    this.fullName = fullName;
    this.role = role;
  }
}