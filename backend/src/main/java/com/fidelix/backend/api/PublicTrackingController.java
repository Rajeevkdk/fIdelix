package com.fidelix.backend.api;

import com.fidelix.backend.api.dto.PublicTrackingResponse;
import com.fidelix.backend.service.PublicTrackingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicTrackingController {

  private final PublicTrackingService service;

  public PublicTrackingController(PublicTrackingService service) {
    this.service = service;
  }

  @GetMapping("/track/{trackingNo}")
  public PublicTrackingResponse track(@PathVariable String trackingNo) {
    return service.track(trackingNo);
  }
}