package com.fidelix.backend.service;

import com.fidelix.backend.api.dto.ReceiptDetailResponse;
import com.fidelix.backend.api.dto.ReceiptListRow;
import com.fidelix.backend.model.Customer;
import com.fidelix.backend.model.Receipt;
import com.fidelix.backend.model.ReceiptItem;
import com.fidelix.backend.model.Shipment;
import com.fidelix.backend.repo.CustomerRepo;
import com.fidelix.backend.repo.ReceiptItemRepo;
import com.fidelix.backend.repo.ReceiptRepo;
import com.fidelix.backend.repo.ShipmentRepo;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReceiptQueryService {

  private final ReceiptRepo receiptRepo;
  private final ShipmentRepo shipmentRepo;
  private final CustomerRepo customerRepo;
  private final ReceiptItemRepo receiptItemRepo;

  public ReceiptQueryService(
      ReceiptRepo receiptRepo,
      ShipmentRepo shipmentRepo,
      CustomerRepo customerRepo,
      ReceiptItemRepo receiptItemRepo
  ) {
    this.receiptRepo = receiptRepo;
    this.shipmentRepo = shipmentRepo;
    this.customerRepo = customerRepo;
    this.receiptItemRepo = receiptItemRepo;
  }

  // ✅ FIX: DB returns Timestamp sometimes, not OffsetDateTime
  private OffsetDateTime toOffsetDateTime(Object v) {
    if (v == null) return null;
    if (v instanceof OffsetDateTime odt) return odt;
    if (v instanceof Timestamp ts) return ts.toInstant().atOffset(ZoneOffset.UTC);
    if (v instanceof java.util.Date d) return d.toInstant().atOffset(ZoneOffset.UTC);
    throw new IllegalArgumentException("Unsupported date type: " + v.getClass());
  }

  private String emptyToNull(String s) {
    if (s == null) return null;
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  public List<ReceiptListRow> todayKathmandu() {
    List<Object[]> rows = receiptRepo.findTodayRowsKathmandu();
    List<ReceiptListRow> out = new ArrayList<>();
    for (Object[] r : rows) {
      out.add(new ReceiptListRow(
          (String) r[0],
          (String) r[1],
          (String) r[2],
          (String) r[3],
          (java.math.BigDecimal) r[4],
          (String) r[5],
          (String) r[6],
          toOffsetDateTime(r[7]) // ✅ fixed
      ));
    }
    return out;
  }

  public List<ReceiptListRow> search(String receiptNo, String trackingNo, String phone,
                                    OffsetDateTime fromDt, OffsetDateTime toDt) {
    List<Object[]> rows = receiptRepo.searchRows(
        emptyToNull(receiptNo),
        emptyToNull(trackingNo),
        emptyToNull(phone),
        fromDt,
        toDt
    );
    List<ReceiptListRow> out = new ArrayList<>();
    for (Object[] r : rows) {
      out.add(new ReceiptListRow(
          (String) r[0],
          (String) r[1],
          (String) r[2],
          (String) r[3],
          (java.math.BigDecimal) r[4],
          (String) r[5],
          (String) r[6],
          toOffsetDateTime(r[7]) // ✅ fixed
      ));
    }
    return out;
  }

  // NOTE: works for now; later we’ll replace stream/findAll with proper repo methods
  public ReceiptDetailResponse getByReceiptNo(String receiptNo) {
    Receipt receipt = receiptRepo.findAll().stream()
        .filter(r -> receiptNo.equals(r.getReceiptNo()))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Receipt not found"));

    Customer c = receipt.getCustomer();

    Shipment shipment = shipmentRepo.findAll().stream()
        .filter(s -> s.getReceipt().getId().equals(receipt.getId()))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Shipment not found"));

    List<ReceiptItem> items = receiptItemRepo.findAll().stream()
        .filter(it -> it.getReceipt().getId().equals(receipt.getId()))
        .sorted((a, b) -> Integer.compare(a.getSn(), b.getSn()))
        .toList();

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
    resp.customer.name = c.getFullName();
    resp.customer.phone = c.getPhone();
    resp.customer.address = c.getAddress();
    resp.customer.panVat = c.getPanVat();

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
}