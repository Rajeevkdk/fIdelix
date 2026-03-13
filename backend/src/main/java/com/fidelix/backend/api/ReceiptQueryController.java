package com.fidelix.backend.api;

import com.fidelix.backend.api.dto.ReceiptListRow;
import com.fidelix.backend.api.dto.ReceiptDetailResponse;
import com.fidelix.backend.service.ReceiptQueryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
public class ReceiptQueryController {

  private final ReceiptQueryService service;

  public ReceiptQueryController(ReceiptQueryService service) {
    this.service = service;
  }

  @GetMapping("/api/receipts/today")
  public List<ReceiptListRow> today() {
    return service.todayKathmandu();
  }

  @GetMapping("/api/receipts/by-no/{receiptNo}")
  public ReceiptDetailResponse byReceiptNo(@PathVariable String receiptNo) {
    return service.getByReceiptNo(receiptNo);
  }

  @GetMapping("/api/receipts/search")
  public List<ReceiptListRow> search(
      @RequestParam(required = false) String receiptNo,
      @RequestParam(required = false) String trackingNo,
      @RequestParam(required = false) String phone,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDt,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDt
  ) {
    return service.search(receiptNo, trackingNo, phone, fromDt, toDt);
  }

  @GetMapping("/api/receipts/export.csv")
  public void exportCsv(
      @RequestParam(required = false) String receiptNo,
      @RequestParam(required = false) String trackingNo,
      @RequestParam(required = false) String phone,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDt,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDt,
      HttpServletResponse response
  ) throws Exception {
    List<ReceiptListRow> rows = service.search(receiptNo, trackingNo, phone, fromDt, toDt);

    response.setContentType("text/csv");
    response.setHeader("Content-Disposition", "attachment; filename=\"receipts.csv\"");

    try (PrintWriter w = response.getWriter()) {
      w.println("receipt_no,tracking_no,customer_name,customer_phone,total,payment_status,issued_by,receipt_date");
      for (ReceiptListRow r : rows) {
        w.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
            csv(r.receiptNo),
            csv(r.trackingNo),
            csv(r.customerName),
            csv(r.customerPhone),
            r.total,
            csv(r.paymentStatus),
            csv(r.issuedBy),
            r.receiptDate
        );
      }
    }
  }

  private String csv(String s) {
    if (s == null) return "";
    String x = s.replace("\"", "\"\"");
    return "\"" + x + "\"";
  }
}