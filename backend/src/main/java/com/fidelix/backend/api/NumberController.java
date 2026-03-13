package com.fidelix.backend.api;

import com.fidelix.backend.service.NumberService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NumberController {

  private final NumberService numberService;

  public NumberController(NumberService numberService) {
    this.numberService = numberService;
  }

  @GetMapping("/api/next-receipt")
  public String nextReceipt() {
    return numberService.nextReceiptNo();
  }

  @GetMapping("/api/next-tracking")
  public String nextTracking() {
    return numberService.nextTrackingNo();
  }
}
