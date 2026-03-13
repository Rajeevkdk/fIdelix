package com.fidelix.backend.repo;

import com.fidelix.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepo extends JpaRepository<Customer, Long> {
  Optional<Customer> findFirstByPhone(String phone);
}
