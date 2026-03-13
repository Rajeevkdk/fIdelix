package com.fidelix.backend.service;

import com.fidelix.backend.repo.CounterRepo;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class NumberService {

  private final CounterRepo counterRepo;
  private final ZoneId zone = ZoneId.systemDefault();

  public NumberService(CounterRepo counterRepo) {
    this.counterRepo = counterRepo;
  }

  private String yyyymm() {
    return ZonedDateTime.now(zone).format(DateTimeFormatter.ofPattern("yyyyMM"));
  }

  // Receipt: FGL-YYYYMM-0001
  public String nextReceiptNo() {
    String ym = yyyymm();
    String key = "RECEIPT_" + ym;
    counterRepo.upsertAndIncrement(key);
    int seq = counterRepo.getCurrentValue(key);
    return String.format("FGL-%s-%04d", ym, seq);
  }

  // Tracking: FGL-YYYYMM-00001
  public String nextTrackingNo() {
    String ym = yyyymm();
    String key = "TRACK_" + ym;
    counterRepo.upsertAndIncrement(key);
    int seq = counterRepo.getCurrentValue(key);
    return String.format("FGL-%s-%05d", ym, seq);
  }

  public String currentYYYYMM() {
  return yyyymm();
}

}
