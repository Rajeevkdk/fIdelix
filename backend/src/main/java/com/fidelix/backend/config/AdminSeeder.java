package com.fidelix.backend.config;

import com.fidelix.backend.model.AppUser;
import com.fidelix.backend.repo.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

  @Bean
  CommandLineRunner seedAdmin(UserRepo userRepo, PasswordEncoder encoder) {
    return args -> {
      if (!userRepo.existsByUsername("admin")) {
        AppUser u = new AppUser();
        u.setUsername("admin");
        u.setFullName("Rajeev Khadka");
        u.setRole("SUPER_ADMIN");
        u.setIsActive(true);

        // Default password (change after first login)
        u.setPasswordHash(encoder.encode("Admin@123"));
        userRepo.save(u);

        System.out.println("✅ Created SUPER_ADMIN user: admin / Admin@123 (please change later)");
      }
    };
  }
}