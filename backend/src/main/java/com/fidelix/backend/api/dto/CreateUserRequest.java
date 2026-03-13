package com.fidelix.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreateUserRequest {
  @NotBlank public String username;
  @NotBlank public String fullName;

  // SUPER_ADMIN or STAFF
  @NotBlank
  @Pattern(regexp = "SUPER_ADMIN|STAFF", message = "role must be SUPER_ADMIN or STAFF")
  public String role;

  // ✅ Required (admin enters password)
  @NotBlank
  public String tempPassword;
}