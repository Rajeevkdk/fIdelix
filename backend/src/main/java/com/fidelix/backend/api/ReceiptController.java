package com.fidelix.backend.api;

import com.fidelix.backend.api.dto.CreateReceiptRequest;
import com.fidelix.backend.api.dto.CreateReceiptResponse;
import com.fidelix.backend.service.ReceiptService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fidelix.backend.security.JwtService.JwtClaims;

@RestController
public class ReceiptController {

  private final ReceiptService receiptService;

  public ReceiptController(ReceiptService receiptService) {
    this.receiptService = receiptService;
  }

  @PostMapping("/api/receipts")
public CreateReceiptResponse create(@Valid @RequestBody CreateReceiptRequest req) {

  var auth = SecurityContextHolder.getContext().getAuthentication();
  if (auth == null || auth.getPrincipal() == null) {
    throw new RuntimeException("Unauthorized");
  }

  JwtClaims claims = (JwtClaims) auth.getPrincipal();
  req.issuedBy = claims.fullName();

  System.out.println("IssuedBy from JWT = " + claims.fullName());

  return receiptService.create(req);
}
}
