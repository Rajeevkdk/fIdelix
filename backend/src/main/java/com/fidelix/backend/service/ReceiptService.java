package com.fidelix.backend.service;

import com.fidelix.backend.api.dto.CreateReceiptRequest;
import com.fidelix.backend.api.dto.CreateReceiptResponse;
import com.fidelix.backend.model.*;
import com.fidelix.backend.repo.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class ReceiptService {

  private final CustomerRepo customerRepo;
  private final ReceiptRepo receiptRepo;
  private final ReceiptItemRepo receiptItemRepo;
  private final ShipmentRepo shipmentRepo;
  private final TrackingEventRepo trackingEventRepo;
  private final NumberService numberService;
  private static final ZoneId KTM = ZoneId.of("Asia/Kathmandu");
private static OffsetDateTime nowKtm() {
  return ZonedDateTime.now(KTM).toOffsetDateTime();
}

  public ReceiptService(CustomerRepo customerRepo,
                        ReceiptRepo receiptRepo,
                        ReceiptItemRepo receiptItemRepo,
                        ShipmentRepo shipmentRepo,
                        TrackingEventRepo trackingEventRepo,
                        NumberService numberService) {
    this.customerRepo = customerRepo;
    this.receiptRepo = receiptRepo;
    this.receiptItemRepo = receiptItemRepo;
    this.shipmentRepo = shipmentRepo;
    this.trackingEventRepo = trackingEventRepo;
    this.numberService = numberService;
  }

  @Transactional
  public CreateReceiptResponse create(CreateReceiptRequest req) {
    // 1) Customer (reuse by phone if exists)
    Customer customer = customerRepo.findFirstByPhone(req.customerPhone).orElseGet(Customer::new);
    customer.setFullName(req.customerName);
    customer.setPhone(req.customerPhone);
    customer.setAddress(req.customerAddress);
    customer.setPanVat(req.customerPanVat);
    customer.setCreatedAt(customer.getCreatedAt() == null ? OffsetDateTime.now() : customer.getCreatedAt());
    customer = customerRepo.save(customer);

    // 2) Numbers
    String yyyymm = numberService.currentYYYYMM();
    String receiptNo = numberService.nextReceiptNo();
    String trackingNo = numberService.nextTrackingNo();

    // Extract sequences (optional) for storing
    int receiptSeq = Integer.parseInt(receiptNo.substring(receiptNo.lastIndexOf('-') + 1));
    int trackingSeq = Integer.parseInt(trackingNo.substring(trackingNo.lastIndexOf('-') + 1));

    // 3) Compute totals
    BigDecimal subtotal = BigDecimal.ZERO;
    int sn = 1;
    for (CreateReceiptRequest.Item it : req.items) {
      BigDecimal amount = it.qty.multiply(it.rate);
      subtotal = subtotal.add(amount);
      sn++;
    }
    BigDecimal discount = (req.discount == null) ? BigDecimal.ZERO : req.discount;
    BigDecimal grand = subtotal.subtract(discount);
    if (grand.compareTo(BigDecimal.ZERO) < 0) grand = BigDecimal.ZERO;

    BigDecimal due = "DUE".equalsIgnoreCase(req.paymentStatus) ? grand : BigDecimal.ZERO;

    // 4) Receipt
    Receipt receipt = new Receipt();
    receipt.setReceiptNo(receiptNo);
    receipt.setReceiptYyyymm(yyyymm);
    receipt.setReceiptSeq(receiptSeq);
    receipt.setReceiptDate(nowKtm());
    receipt.setCurrency("NPR");
    receipt.setPaymentMode(req.paymentMode.toUpperCase());
    receipt.setPaymentStatus(req.paymentStatus.toUpperCase());
    receipt.setSubtotal(subtotal);
    receipt.setDiscount(discount);
    receipt.setGrandTotal(grand);
    receipt.setDueAmount(due);
    receipt.setIssuedBy(req.issuedBy);
    receipt.setCustomer(customer);
    receipt = receiptRepo.save(receipt);

    // 5) Receipt items
    int sn2 = 1;
    for (CreateReceiptRequest.Item it : req.items) {
      ReceiptItem ri = new ReceiptItem();
      ri.setReceipt(receipt);
      ri.setSn(sn2++);
      ri.setDescription(it.description);
      ri.setQty(it.qty);
      ri.setRate(it.rate);
      ri.setAmount(it.qty.multiply(it.rate));
      receiptItemRepo.save(ri);
    }

    // 6) Shipment + tracking number
    Shipment shipment = new Shipment();
    shipment.setTrackingNo(trackingNo);
    shipment.setTrackingYyyymm(yyyymm);
    shipment.setTrackingSeq(trackingSeq);
    shipment.setCreatedAt(nowKtm());
    shipment.setReceipt(receipt);

    shipment.setShipmentType(req.shipmentType.toUpperCase());
    shipment.setServiceType(req.serviceType == null ? null : req.serviceType.toUpperCase());
    shipment.setWeightKg(req.weightKg);
    shipment.setPieces(req.pieces == null ? 1 : req.pieces);
    shipment.setNotes(req.notes);

    shipment.setReceiverName(req.receiverName);
    shipment.setReceiverPhone(req.receiverPhone);
    shipment.setReceiverAddress(req.receiverAddress);
    shipment.setReceiverCityCountry(req.receiverCityCountry);
    shipment.setReceiverPostalCode(req.receiverPostalCode);
    shipment.setReceiverEmail(req.receiverEmail);
    shipment = shipmentRepo.save(shipment);

    // 7) First tracking event: Booked
    TrackingEvent ev = new TrackingEvent();
    ev.setShipment(shipment);
    ev.setStatus("BOOKED");
    ev.setLocation("Khadkagau, Kalanki-14, Kathmandu");
    ev.setNote("Booked");
    ev.setEventTime(nowKtm());
    ev.setUpdatedBy(req.issuedBy);
    trackingEventRepo.save(ev);

    return new CreateReceiptResponse(receiptNo, trackingNo);
  }
}
