package com.fidelix.backend.api;

import com.fidelix.backend.api.dto.ChangePasswordRequest;
import com.fidelix.backend.api.dto.CreateUserRequest;
import com.fidelix.backend.api.dto.CreateUserResponse;
import com.fidelix.backend.api.dto.UserSummary;
import com.fidelix.backend.security.JwtService.JwtClaims;
import com.fidelix.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  private JwtClaims claims() {
    return (JwtClaims) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
  }

  private void requireSuperAdmin() {
    if (!"SUPER_ADMIN".equals(claims().role())) {
      throw new RuntimeException("Forbidden: SUPER_ADMIN only");
    }
  }

  @GetMapping("/api/users")
  public List<UserSummary> listUsers() {
    requireSuperAdmin();
    return userService.listUsers();
  }

  @PostMapping("/api/users")
  public CreateUserResponse createUser(@Valid @RequestBody CreateUserRequest req) {
    requireSuperAdmin();
    return userService.createUser(req);
  }

  @PostMapping("/api/users/change-password")
  public void changeMyPassword(@Valid @RequestBody ChangePasswordRequest req) {
    JwtClaims c = claims();
    userService.changePassword(c.username(), req.currentPassword, req.newPassword);
  }

  @PostMapping("/api/users/{id}/deactivate")
  public void deactivate(@PathVariable Long id) {
    requireSuperAdmin();
    userService.setActive(id, false);
  }

  @PostMapping("/api/users/{id}/activate")
  public void activate(@PathVariable Long id) {
    requireSuperAdmin();
    userService.setActive(id, true);
  }

  public static class ResetPasswordRequest {
    @NotBlank public String tempPassword;
  }

  @PostMapping("/api/users/{id}/reset-password")
  public void resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest req) {
    requireSuperAdmin();
    userService.resetPassword(id, req.tempPassword);
  }
}