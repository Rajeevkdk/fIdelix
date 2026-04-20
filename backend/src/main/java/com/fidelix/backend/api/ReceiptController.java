package com.fidelix.backend.api;

import com.fidelix.backend.api.dto.CreateReceiptRequest;
import com.fidelix.backend.api.dto.CreateReceiptResponse;
import com.fidelix.backend.api.dto.UpdateReceiptRequest;
import com.fidelix.backend.service.ReceiptService;
import com.fidelix.backend.security.JwtService.JwtClaims;
import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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

    return receiptService.create(req);
  }

  @PutMapping("/api/receipts/{receiptNo}")
  public CreateReceiptResponse update(
      @PathVariable String receiptNo,
      @Valid @RequestBody UpdateReceiptRequest req
  ) {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getPrincipal() == null) {
      throw new RuntimeException("Unauthorized");
    }

    JwtClaims claims = (JwtClaims) auth.getPrincipal();
    req.issuedBy = claims.fullName();

    return receiptService.update(receiptNo, req);
  }
}