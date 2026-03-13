package com.fidelix.backend.api;

import com.fidelix.backend.api.dto.LoginRequest;
import com.fidelix.backend.api.dto.LoginResponse;
import com.fidelix.backend.repo.UserRepo;
import com.fidelix.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

  private final UserRepo userRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepo = userRepo;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/api/auth/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest req) {
    var user = userRepo.findByUsername(req.username)
        .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
        .orElseThrow(() -> new RuntimeException("Invalid username or password"));

    if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
      throw new RuntimeException("Invalid username or password");
    }

    String token = jwtService.createToken(user.getUsername(), user.getFullName(), user.getRole());
    return new LoginResponse(token, user.getUsername(), user.getFullName(), user.getRole());
  }
}