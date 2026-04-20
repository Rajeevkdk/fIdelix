package com.fidelix.backend.service;

import com.fidelix.backend.api.dto.ReceiptDetailResponse;
import com.fidelix.backend.api.dto.ReceiptListRow;
import com.fidelix.backend.model.Customer;
import com.fidelix.backend.model.Receipt;
import com.fidelix.backend.model.ReceiptItem;
import com.fidelix.backend.model.Shipment;
import com.fidelix.backend.repo.ReceiptItemRepo;
import com.fidelix.backend.repo.ReceiptRepo;
import com.fidelix.backend.repo.ShipmentRepo;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ReceiptQueryService {

  private static final ZoneId KTM = ZoneId.of("Asia/Kathmandu");

  private final ReceiptRepo receiptRepo;
  private final ShipmentRepo shipmentRepo;
  private final ReceiptItemRepo receiptItemRepo;

  public ReceiptQueryService(
      ReceiptRepo receiptRepo,
      ShipmentRepo shipmentRepo,
      ReceiptItemRepo receiptItemRepo
  ) {
    this.receiptRepo = receiptRepo;
    this.shipmentRepo = shipmentRepo;
    this.receiptItemRepo = receiptItemRepo;
  }

  private String emptyToNull(String s) {
    if (s == null) return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  public List<ReceiptListRow> todayKathmandu() {
    OffsetDateTime fromDt = OffsetDateTime.now(KTM)
        .toLocalDate()
        .atStartOfDay(KTM)
        .toOffsetDateTime();

    OffsetDateTime toDt = fromDt.plusDays(1);

    return mapRows(receiptRepo.findByReceiptDateBetweenOrderByIdDesc(fromDt, toDt));
  }

  public List<ReceiptListRow> search(
      String receiptNo,
      String trackingNo,
      String phone,
      OffsetDateTime fromDt,
      OffsetDateTime toDt
  ) {
    String xReceiptNo = emptyToNull(receiptNo);
    String xTrackingNo = emptyToNull(trackingNo);
    String xPhone = emptyToNull(phone);

    List<Receipt> base;

    if (fromDt != null || toDt != null) {
      OffsetDateTime from = fromDt != null ? fromDt : OffsetDateTime.parse("2000-01-01T00:00:00Z");
      OffsetDateTime to = toDt != null ? toDt : OffsetDateTime.parse("2999-12-31T23:59:59Z");
      base = receiptRepo.findByReceiptDateBetweenOrderByIdDesc(from, to);
    } else {
      base = receiptRepo.findAll()
          .stream()
          .sorted(Comparator.comparing(Receipt::getId).reversed())
          .toList();
    }

    List<ReceiptListRow> out = new ArrayList<>();

    for (Receipt r : base) {
      Customer c = r.getCustomer();
      Shipment s = shipmentRepo.findByReceipt(r).orElse(null);
      if (s == null) continue;

      boolean match =
          (xReceiptNo == null || containsIgnoreCase(r.getReceiptNo(), xReceiptNo)) &&
          (xTrackingNo == null || containsIgnoreCase(s.getTrackingNo(), xTrackingNo)) &&
          (xPhone == null || containsIgnoreCase(c == null ? null : c.getPhone(), xPhone));

      if (!match) continue;

      out.add(new ReceiptListRow(
          r.getReceiptNo(),
          s.getTrackingNo(),
          c == null ? "" : c.getFullName(),
          c == null ? "" : c.getPhone(),
          r.getGrandTotal(),
          r.getPaymentStatus(),
          r.getIssuedBy(),
          r.getReceiptDate()
      ));
    }

    return out;
  }

  public ReceiptDetailResponse getByReceiptNo(String receiptNo) {
    Receipt receipt = receiptRepo.findByReceiptNo(receiptNo)
        .orElseThrow(() -> new RuntimeException("Receipt not found"));

    Customer c = receipt.getCustomer();

    Shipment shipment = shipmentRepo.findByReceipt(receipt)
        .orElseThrow(() -> new RuntimeException("Shipment not found"));

    List<ReceiptItem> items = receiptItemRepo.findByReceiptOrderBySnAsc(receipt);

    ReceiptDetailResponse resp = new ReceiptDetailResponse();
    resp.receiptNo = receipt.getReceiptNo();
    resp.receiptDate = receipt.getReceiptDate();
    resp.currency = receipt.getCurrency();
    resp.paymentMode = receipt.getPaymentMode();
    resp.paymentStatus = receipt.getPaymentStatus();
    resp.subtotal = receipt.getSubtotal();
    resp.discount = receipt.getDiscount();
    resp.grandTotal = receipt.getGrandTotal();
    resp.dueAmount = receipt.getDueAmount();
    resp.issuedBy = receipt.getIssuedBy();

    resp.customer = new ReceiptDetailResponse.Customer();
    resp.customer.name = c == null ? null : c.getFullName();
    resp.customer.phone = c == null ? null : c.getPhone();
    resp.customer.address = c == null ? null : c.getAddress();
    resp.customer.panVat = c == null ? null : c.getPanVat();

    resp.shipment = new ReceiptDetailResponse.Shipment();
    resp.shipment.trackingNo = shipment.getTrackingNo();
    resp.shipment.shipmentType = shipment.getShipmentType();
    resp.shipment.serviceType = shipment.getServiceType();
    resp.shipment.weightKg = shipment.getWeightKg();
    resp.shipment.pieces = shipment.getPieces();
    resp.shipment.notes = shipment.getNotes();
    resp.shipment.receiverName = shipment.getReceiverName();
    resp.shipment.receiverPhone = shipment.getReceiverPhone();
    resp.shipment.receiverAddress = shipment.getReceiverAddress();
    resp.shipment.receiverCityCountry = shipment.getReceiverCityCountry();
    resp.shipment.receiverPostalCode = shipment.getReceiverPostalCode();
    resp.shipment.receiverEmail = shipment.getReceiverEmail();
    resp.shipment.forwardingTrackingNo = shipment.getForwardingTrackingNo();
    resp.shipment.forwardingTrackingUrl = shipment.getForwardingTrackingUrl();

    resp.items = new ArrayList<>();
    for (ReceiptItem it : items) {
      ReceiptDetailResponse.Item x = new ReceiptDetailResponse.Item();
      x.sn = it.getSn();
      x.description = it.getDescription();
      x.qty = it.getQty();
      x.rate = it.getRate();
      x.amount = it.getAmount();
      resp.items.add(x);
    }

    return resp;
  }

  private List<ReceiptListRow> mapRows(List<Receipt> receipts) {
    List<ReceiptListRow> out = new ArrayList<>();

    for (Receipt r : receipts) {
      Shipment s = shipmentRepo.findByReceipt(r).orElse(null);
      if (s == null) continue;

      Customer c = r.getCustomer();

      out.add(new ReceiptListRow(
          r.getReceiptNo(),
          s.getTrackingNo(),
          c == null ? "" : c.getFullName(),
          c == null ? "" : c.getPhone(),
          r.getGrandTotal(),
          r.getPaymentStatus(),
          r.getIssuedBy(),
          r.getReceiptDate()
      ));
    }

    return out;
  }

  private boolean containsIgnoreCase(String source, String needle) {
    if (source == null || needle == null) return false;
    return source.toLowerCase().contains(needle.toLowerCase());
  }
}