package com.fidelix.backend.service;

import com.fidelix.backend.api.dto.CreateUserRequest;
import com.fidelix.backend.api.dto.CreateUserResponse;
import com.fidelix.backend.api.dto.UserSummary;
import com.fidelix.backend.model.AppUser;
import com.fidelix.backend.repo.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

  private final UserRepo userRepo;
  private final PasswordEncoder encoder;

  public UserService(UserRepo userRepo, PasswordEncoder encoder) {
    this.userRepo = userRepo;
    this.encoder = encoder;
  }

  public List<UserSummary> listUsers() {
    return userRepo.findAll().stream()
        .map(u -> new UserSummary(
            u.getId(),
            u.getUsername(),
            u.getFullName(),
            u.getRole(),
            Boolean.TRUE.equals(u.getIsActive()),
            u.getCreatedAt()
        ))
        .toList();
  }

  public CreateUserResponse createUser(CreateUserRequest req) {
    String username = req.username.trim().toLowerCase();

    if (userRepo.existsByUsername(username)) {
      throw new RuntimeException("Username already exists");
    }

    String password = req.tempPassword == null ? "" : req.tempPassword.trim();
    if (password.length() < 8) {
      throw new RuntimeException("Password must be at least 8 characters");
    }

    AppUser u = new AppUser();
    u.setUsername(username);
    u.setFullName(req.fullName.trim());
    u.setRole(req.role.trim()); // SUPER_ADMIN or STAFF
    u.setIsActive(true);
    u.setPasswordHash(encoder.encode(password));

    AppUser saved = userRepo.save(u);

    return new CreateUserResponse(
        saved.getId(),
        saved.getUsername(),
        saved.getFullName(),
        saved.getRole(),
        Boolean.TRUE.equals(saved.getIsActive())
    );
  }

  public void changePassword(String username, String currentPassword, String newPassword) {
    AppUser user = userRepo.findByUsername(username.trim().toLowerCase())
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (!Boolean.TRUE.equals(user.getIsActive())) {
      throw new RuntimeException("User is inactive");
    }

    if (!encoder.matches(currentPassword, user.getPasswordHash())) {
      throw new RuntimeException("Current password is incorrect");
    }

    if (newPassword == null || newPassword.trim().length() < 8) {
      throw new RuntimeException("New password must be at least 8 characters");
    }

    user.setPasswordHash(encoder.encode(newPassword.trim()));
    userRepo.save(user);
  }

  public void setActive(Long id, boolean active) {
    AppUser user = userRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found"));
    user.setIsActive(active);
    userRepo.save(user);
  }

  public void resetPassword(Long id, String tempPassword) {
    AppUser user = userRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found"));

    String password = tempPassword == null ? "" : tempPassword.trim();
    if (password.length() < 8) {
      throw new RuntimeException("Password must be at least 8 characters");
    }

    user.setPasswordHash(encoder.encode(password));
    userRepo.save(user);
  }
}