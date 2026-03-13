package com.fidelix.backend.repo;

import com.fidelix.backend.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface ReceiptRepo extends JpaRepository<Receipt, Long> {

  // Today in Asia/Kathmandu
  @Query(value = """
    select
      r.receipt_no,
      s.tracking_no,
      c.full_name,
      c.phone,
      r.grand_total,
      r.payment_status,
      r.issued_by,
      r.receipt_date
    from receipts r
    join customers c on c.id = r.customer_id
    join shipments s on s.receipt_id = r.id
    where (r.receipt_date at time zone 'Asia/Kathmandu')::date =
          (now() at time zone 'Asia/Kathmandu')::date
    order by r.id desc
    """, nativeQuery = true)
  List<Object[]> findTodayRowsKathmandu();

  // Search with optional filters + Kathmandu-local date range
  @Query(value = """
    select
      r.receipt_no,
      s.tracking_no,
      c.full_name,
      c.phone,
      r.grand_total,
      r.payment_status,
      r.issued_by,
      r.receipt_date
    from receipts r
    join customers c on c.id = r.customer_id
    join shipments s on s.receipt_id = r.id
    where
      (:receiptNo is null or r.receipt_no ilike '%' || :receiptNo || '%')
      and (:trackingNo is null or s.tracking_no ilike '%' || :trackingNo || '%')
      and (:phone is null or c.phone ilike '%' || :phone || '%')
      and (
        (:fromDt is null and :toDt is null)
        or (
          (r.receipt_date at time zone 'Asia/Kathmandu') >= (cast(:fromDt as timestamptz) at time zone 'Asia/Kathmandu')
          and (r.receipt_date at time zone 'Asia/Kathmandu') <  (cast(:toDt as timestamptz) at time zone 'Asia/Kathmandu')
        )
      )
    order by r.id desc
    """, nativeQuery = true)
  List<Object[]> searchRows(
      @Param("receiptNo") String receiptNo,
      @Param("trackingNo") String trackingNo,
      @Param("phone") String phone,
      @Param("fromDt") OffsetDateTime fromDt,
      @Param("toDt") OffsetDateTime toDt
  );
}