import { useEffect, useMemo, useState } from "react";
import "./App.css";
import InvoiceTab from "./components/InvoiceTab";

type LoginInfo = {
  token: string;
  username: string;
  fullName: string;
  role: "SUPER_ADMIN" | "STAFF";
};

type Item = { id: string; description: string; qty: number; rate: number };

type UserSummary = {
  id: number;
  username: string;
  fullName: string;
  role: "SUPER_ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
};

type ReceiptListRow = {
  receiptNo: string;
  trackingNo: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentStatus: string;
  issuedBy: string;
  receiptDate: string;
};

type ReceiptDetailResponse = {
  receiptNo: string;
  receiptDate: string;
  currency: string;
  paymentMode: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  grandTotal: number;
  dueAmount: number;
  issuedBy: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    panVat: string | null;
  };
  shipment: {
    trackingNo: string;
    shipmentType: string;
    serviceType: string | null;
    weightKg: number | null;
    pieces: number;
    notes: string | null;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    receiverCityCountry: string;
    receiverPostalCode: string;
    receiverEmail: string | null;
    forwardingTrackingNo?: string | null;
forwardingTrackingUrl?: string | null;
  };
  items: Array<{
    sn: number;
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
};

function npr(n: number) {
  return new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n || 0);
}

function uuid() {
  return crypto.randomUUID();
}

export default function App() {
  const API = "https://api.fidelixglobal.com";

  async function api(path: string, init: RequestInit = {}) {
    const token = localStorage.getItem("fidelix_token");
    if (!token) throw new Error("Not logged in. Please login again.");

    const headers = new Headers(init.headers || undefined);
    headers.set("Authorization", `Bearer ${token}`);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API}${path}`, { ...init, headers });

    if (res.status === 401 || res.status === 403) {
      throw new Error(`Unauthorized (${res.status}). Please logout/login again.`);
    }

    return res;
  }

  const [auth, setAuth] = useState<LoginInfo | null>(null);
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("fidelix_token");
    const username = localStorage.getItem("fidelix_username");
    const fullName = localStorage.getItem("fidelix_fullName");
    const role = localStorage.getItem("fidelix_role") as "SUPER_ADMIN" | "STAFF" | null;

    if (token && username && fullName && role) {
      setAuth({ token, username, fullName, role });
      setIssuedBy(fullName);
    }
  }, []);

  async function doLogin() {
    setLoginErr("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as LoginInfo;

      localStorage.setItem("fidelix_token", data.token);
      localStorage.setItem("fidelix_username", data.username);
      localStorage.setItem("fidelix_fullName", data.fullName);
      localStorage.setItem("fidelix_role", data.role);

      setAuth(data);
      setIssuedBy(data.fullName);
      setLoginPassword("");
    } catch (e: any) {
      setLoginErr(e?.message ?? String(e));
    }
  }

  function logout() {
    localStorage.clear();
    setAuth(null);
    setErr("");
    setLoginErr("");
  }

  const [tab, setTab] = useState<"NEW" | "RECEIPTS" | "INVOICE" | "ACCOUNT" | "USERS">("NEW");

  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  function showOk(msg: string) {
    setOkMsg(msg);
    setTimeout(() => setOkMsg(""), 2500);
  }

  const [editingReceiptNo, setEditingReceiptNo] = useState<string | null>(null);
  const [editingTrackingNo, setEditingTrackingNo] = useState<string | null>(null);

  const [issuedBy, setIssuedBy] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPanVat, setCustomerPanVat] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverCityCountry, setReceiverCityCountry] = useState("");
  const [receiverPostalCode, setReceiverPostalCode] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");

  const [shipmentType, setShipmentType] = useState("PARCEL");
  const [serviceType, setServiceType] = useState("AIR");
  const [weightKg, setWeightKg] = useState<number>(0);
  const [pieces, setPieces] = useState<number>(1);
  const [notes, setNotes] = useState("");

  const [forwardingTrackingNo, setForwardingTrackingNo] = useState("");
  const [forwardingTrackingUrl, setForwardingTrackingUrl] = useState("");

  const [paymentMode, setPaymentMode] = useState("CASH");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "DUE">("PAID");
  const [discount, setDiscount] = useState<number>(0);

  const [items, setItems] = useState<Item[]>([
    { id: uuid(), description: "Shipping Charge", qty: 1, rate: 0 },
  ]);

  const computed = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
      0
    );
    const grand = Math.max(0, subtotal - (Number(discount) || 0));
    const due = paymentStatus === "DUE" ? grand : 0;
    return { subtotal, grand, due };
  }, [items, discount, paymentStatus]);

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: uuid(), description: "", qty: 1, rate: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((it) => it.id !== id)));
  }

  function resetForm() {
    setEditingReceiptNo(null);
    setEditingTrackingNo(null);

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerPanVat("");

    setReceiverName("");
    setReceiverPhone("");
    setReceiverAddress("");
    setReceiverCityCountry("");
    setReceiverPostalCode("");
    setReceiverEmail("");

    setForwardingTrackingNo("");
setForwardingTrackingUrl("");

    setShipmentType("PARCEL");
    setServiceType("AIR");
    setWeightKg(0);
    setPieces(1);
    setNotes("");

    setPaymentMode("CASH");
    setPaymentStatus("PAID");
    setDiscount(0);

    setItems([{ id: uuid(), description: "Shipping Charge", qty: 1, rate: 0 }]);
  }

  async function createOrUpdateReceipt() {
    setErr("");
    setOkMsg("");

    try {
      const payload = {
        customerName,
        customerPhone,
        customerAddress,
        customerPanVat,
        receiverName,
        receiverPhone,
        receiverAddress,
        receiverCityCountry,
        receiverPostalCode,
        receiverEmail,
        forwardingTrackingNo,
        forwardingTrackingUrl,
        shipmentType,
        serviceType,
        weightKg: Number(weightKg) || 0,
        pieces: Number(pieces) || 1,
        notes,
        paymentMode,
        paymentStatus,
        discount: Number(discount) || 0,
        issuedBy,
        items: items.map((i) => ({
          description: i.description,
          qty: Number(i.qty) || 0,
          rate: Number(i.rate) || 0,
        })),
      };

      const path = editingReceiptNo
        ? `/api/receipts/${editingReceiptNo}`
        : "/api/receipts";

      const method = editingReceiptNo ? "PUT" : "POST";

      const res = await api(path, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (!editingReceiptNo && data?.receiptNo) setEditingReceiptNo(data.receiptNo);
      if (!editingTrackingNo && data?.trackingNo) setEditingTrackingNo(data.trackingNo);

      showOk(
        editingReceiptNo
          ? `Receipt updated successfully: ${data.receiptNo || editingReceiptNo}`
          : `Receipt saved successfully: ${data.receiptNo || ""}`
      );

      if (!editingReceiptNo) {
        resetForm();
        setIssuedBy(auth?.fullName || "");
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  const [receipts, setReceipts] = useState<ReceiptListRow[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const [searchReceiptNo, setSearchReceiptNo] = useState("");
  const [searchTrackingNo, setSearchTrackingNo] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

 const [searchFromDate, setSearchFromDate] = useState("");
const [searchToDate, setSearchToDate] = useState("");

function toKtmIsoStart(dateStr: string) {
  if (!dateStr) return "";
  return `${dateStr}T00:00:00+05:45`;
}

function toKtmIsoNextDay(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T00:00:00+05:45`;
}

function buildReceiptQueryParams() {
  const qs = new URLSearchParams();
  if (searchReceiptNo.trim()) qs.set("receiptNo", searchReceiptNo.trim());
  if (searchTrackingNo.trim()) qs.set("trackingNo", searchTrackingNo.trim());
  if (searchPhone.trim()) qs.set("phone", searchPhone.trim());
  if (searchFromDate) qs.set("fromDt", toKtmIsoStart(searchFromDate));
  if (searchToDate) qs.set("toDt", toKtmIsoNextDay(searchToDate));
  return qs;
}

async function exportReceiptsCsv() {
  try {
    setErr("");
    const token = localStorage.getItem("fidelix_token");
    if (!token) throw new Error("Not logged in");

    const qs = buildReceiptQueryParams();
    const res = await fetch(`${API}/api/receipts/export.csv?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipts.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e: any) {
    setErr(e?.message ?? String(e));
  }
}

function exportReceiptsPdf() {
  try {
    const rows = receipts
      .map(
        (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.receiptNo}</td>
            <td>${r.trackingNo}</td>
            <td>${r.customerName}</td>
            <td>${r.customerPhone}</td>
            <td>${npr(Number(r.total || 0))}</td>
            <td>${r.paymentStatus}</td>
            <td>${new Date(r.receiptDate).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipts Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 12mm; }
          h1 { font-size: 18px; margin: 0 0 4px; }
          .meta { font-size: 12px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Fidelix Receipts Report</h1>
        <div class="meta">
          Receipt No: ${searchReceiptNo || "All"} |
          Tracking No: ${searchTrackingNo || "All"} |
          Phone: ${searchPhone || "All"} |
          From: ${searchFromDate || "—"} |
          To: ${searchToDate || "—"}
        </div>
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Receipt No</th>
              <th>Tracking No</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="8">No receipts found</td></tr>`}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1200,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  } catch (e: any) {
    setErr(e?.message ?? String(e));
  }
}

  async function loadReceipts() {
    setErr("");
    try {
      setLoadingReceipts(true);

      const qs = buildReceiptQueryParams();

      const res = await api(`/api/receipts/search${qs.toString() ? `?${qs.toString()}` : ""}`);
      if (!res.ok) throw new Error(await res.text());

      const data = (await res.json()) as ReceiptListRow[];
      setReceipts(data);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoadingReceipts(false);
    }
  }

  async function editReceipt(receiptNo: string) {
    setErr("");
    try {
      const res = await api(`/api/receipts/by-no/${receiptNo}`);
      if (!res.ok) throw new Error(await res.text());

      const data = (await res.json()) as ReceiptDetailResponse;

      setEditingReceiptNo(data.receiptNo);
      setEditingTrackingNo(data.shipment?.trackingNo || null);

      setCustomerName(data.customer?.name || "");
      setCustomerPhone(data.customer?.phone || "");
      setCustomerAddress(data.customer?.address || "");
      setCustomerPanVat(data.customer?.panVat || "");

      setReceiverName(data.shipment?.receiverName || "");
      setReceiverPhone(data.shipment?.receiverPhone || "");
      setReceiverAddress(data.shipment?.receiverAddress || "");
      setReceiverCityCountry(data.shipment?.receiverCityCountry || "");
      setReceiverPostalCode(data.shipment?.receiverPostalCode || "");
      setReceiverEmail(data.shipment?.receiverEmail || "");

      setShipmentType(data.shipment?.shipmentType || "PARCEL");
      setServiceType(data.shipment?.serviceType || "AIR");
      setWeightKg(Number(data.shipment?.weightKg || 0));
      setPieces(Number(data.shipment?.pieces || 1));
      setNotes(data.shipment?.notes || "");

      setForwardingTrackingNo((data.shipment as any)?.forwardingTrackingNo || "");
      setForwardingTrackingUrl((data.shipment as any)?.forwardingTrackingUrl || "");

      setPaymentMode(data.paymentMode || "CASH");
      setPaymentStatus((data.paymentStatus || "PAID") as "PAID" | "DUE");
      setDiscount(Number(data.discount || 0));

      setItems(
        (data.items || []).length > 0
          ? data.items.map((x) => ({
              id: uuid(),
              description: x.description,
              qty: Number(x.qty || 0),
              rate: Number(x.rate || 0),
            }))
          : [{ id: uuid(), description: "Shipping Charge", qty: 1, rate: 0 }]
      );

      setTab("NEW");
      showOk(`Loaded receipt for editing: ${receiptNo}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    if (tab === "RECEIPTS") {
      loadReceipts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const isSuperAdmin = auth?.role === "SUPER_ADMIN";

  const [newUUsername, setNewUUsername] = useState("");
  const [newUFullName, setNewUFullName] = useState("");
  const [newURole, setNewURole] = useState<"STAFF" | "SUPER_ADMIN">("STAFF");
  const [newUPassword, setNewUPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  async function loadUsers() {
    if (!isSuperAdmin) return;
    setErr("");
    try {
      setLoadingUsers(true);
      const res = await api("/api/users");
      const data = (await res.json()) as UserSummary[];
      setUsers(data);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (tab === "USERS" && isSuperAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function createUser() {
    setErr("");
    setOkMsg("");

    if (!isSuperAdmin) return setErr("Only SUPER_ADMIN can create users.");
    if (!newUUsername.trim()) return setErr("Username required");
    if (!newUFullName.trim()) return setErr("Full name required");
    if (!newUPassword.trim() || newUPassword.trim().length < 8) {
      return setErr("Password must be at least 8 chars");
    }

    try {
      setCreatingUser(true);
      const res = await api("/api/users", {
        method: "POST",
        body: JSON.stringify({
          username: newUUsername.trim(),
          fullName: newUFullName.trim(),
          role: newURole,
          tempPassword: newUPassword,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      showOk("User created successfully");

      setNewUUsername("");
      setNewUFullName("");
      setNewURole("STAFF");
      setNewUPassword("");

      await loadUsers();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setCreatingUser(false);
    }
  }

  async function changeMyPassword() {
    setErr("");
    setOkMsg("");

    if (!curPass.trim()) return setErr("Current password required");
    if (!newPass.trim() || newPass.trim().length < 8) {
      return setErr("New password must be at least 8 chars");
    }
    if (newPass !== newPass2) return setErr("New password and confirm password do not match");

    try {
      setChangingPass(true);
      const res = await api("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      if (!res.ok) throw new Error(await res.text());

      showOk("Password changed successfully");
      setCurPass("");
      setNewPass("");
      setNewPass2("");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setChangingPass(false);
    }
  }

  // ===== PREVIEW / PRINT =====
  const company = {
    name: "Fidelix Global Logistics Pvt. Ltd.",
    address: "Khadkagaun, Kalanki-14, Kathmandu, Nepal",
    postal: "44600",
    pan: "623531576",
    reg: "—",
    email: "logisticsfidelix@gmail.com",
    web: "www.fidelixglobal.com",
  };

  const [activePreview, setActivePreview] = useState<"RECEIPT" | "TRACKING">("RECEIPT");
  const [printMode, setPrintMode] = useState<"COLOR" | "BW">("COLOR");

  const savedReceiptNo = editingReceiptNo || "—";
  const savedTrackingNo = editingTrackingNo || "—";

  function escapeHtml(v: string) {
    return (v ?? "").replace(/[&<>"']/g, (c) => {
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[c] || c;
    });
  }

  function buildReceiptHtmlFromForm() {
    const bw = printMode === "BW";
    const dateStr = new Date().toLocaleString();

    const rows = items
      .map((it, idx) => {
        const amt = (Number(it.qty) || 0) * (Number(it.rate) || 0);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(it.description)}</td>
            <td>${it.qty}</td>
            <td>${npr(it.rate)}</td>
            <td>${npr(amt)}</td>
          </tr>
        `;
      })
      .join("");

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Arial, sans-serif; margin: 12mm; ${bw ? "filter: grayscale(1);" : ""} }
  .top { display:flex; justify-content:space-between; gap:12px; }
  .left { display:flex; gap:10px; align-items:center; }
  .logo { width:90px; height:50px; object-fit:contain; }
  .kv { font-size:12px; line-height:1.45; }
  .title { text-align:center; font-weight:900; margin:12px 0; letter-spacing:1px; }
  .box2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .box { border:1px solid #ddd; padding:10px; border-radius:10px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; font-size:12px; }
  th,td { border-top:1px solid #ddd; padding:8px; text-align:left; }
  th { background:#f5f7fb; }
  .tot { margin-top:10px; display:flex; justify-content:flex-end; }
  .totbox { width:280px; font-size:12px; }
  .row { display:flex; justify-content:space-between; }
  .footer { margin-top:14px; display:flex; justify-content:space-between; gap:10px; font-size:12px; }
  .stamp { border:1px dashed #999; border-radius:10px; padding:10px; width:180px; text-align:center; }
</style>
</head>
<body>
  <div class="top">
    <div class="left">
      <img class="logo" src="/logo.png" alt="logo" />
      <div class="kv">
        <div style="font-weight:900">${company.name}</div>
        ${company.address} (Postal: ${company.postal})<br/>
        PAN: ${company.pan} | Reg: ${company.reg}<br/>
        ${company.email} | ${company.web}
      </div>
    </div>
    <div class="kv" style="text-align:right">
      <div><b>Receipt No:</b> ${savedReceiptNo}</div>
      <div><b>Tracking No:</b> ${savedTrackingNo}</div>
      <div><b>Date:</b> ${dateStr}</div>
      <div><b>Status:</b> ${paymentStatus}</div>
    </div>
  </div>

  <div class="title">Fidelix Receipt</div>

  <div class="box2">
    <div class="box">
      <div style="font-weight:800; margin-bottom:6px;">Customer</div>
      <div class="kv">Name: ${escapeHtml(customerName || "—")}</div>
      <div class="kv">Phone: ${escapeHtml(customerPhone || "—")}</div>
      <div class="kv">Address: ${escapeHtml(customerAddress || "—")}</div>
      <div class="kv">PAN/VAT: ${escapeHtml(customerPanVat || "—")}</div>
    </div>
    <div class="box">
      <div style="font-weight:800; margin-bottom:6px;">Receiver</div>
      <div class="kv">Name: ${escapeHtml(receiverName || "—")}</div>
      <div class="kv">Phone: ${escapeHtml(receiverPhone || "—")}</div>
      <div class="kv">Address: ${escapeHtml(receiverAddress || "—")}</div>
      <div class="kv">City/Country: ${escapeHtml(receiverCityCountry || "—")}</div>
      <div class="kv">Postal Code: ${escapeHtml(receiverPostalCode || "—")}</div>
      <div class="kv">Email: ${escapeHtml(receiverEmail || "—")}</div>
    </div>
  </div>

  <div class="box2" style="margin-top:10px;">
    <div class="box">
      <div style="font-weight:800; margin-bottom:6px;">Shipment</div>
      <div class="kv">Type: ${escapeHtml(shipmentType || "—")}</div>
      <div class="kv">Service: ${escapeHtml(serviceType || "—")}</div>
      <div class="kv">Weight: ${weightKg || 0} Kg</div>
      <div class="kv">Pieces: ${pieces || 0}</div>
      <div class="kv">Notes: ${escapeHtml(notes || "—")}</div>
    </div>
    <div class="box">
      <div style="font-weight:800; margin-bottom:6px;">Billing</div>
      <div class="kv">Payment Mode: ${escapeHtml(paymentMode || "—")}</div>
      <div class="kv">Payment Status: ${escapeHtml(paymentStatus || "—")}</div>
      <div class="kv">Issued By: ${escapeHtml(issuedBy || "—")}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>SN</th>
        <th>Description</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="tot">
    <div class="totbox">
      <div class="row"><span>Subtotal</span><span>${npr(computed.subtotal)}</span></div>
      <div class="row"><span>Discount</span><span>${npr(discount)}</span></div>
      <div class="row"><span>Grand Total</span><span>${npr(computed.grand)}</span></div>
      <div class="row"><span>Due</span><span>${npr(computed.due)}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>
      <b>Remarks:</b><br/>
      Thank you for choosing Fidelix Global Logistics.
    </div>
    <div class="stamp">
      Company Stamp<br/><br/>
      Issued By: ${escapeHtml(issuedBy || "—")}
    </div>
  </div>
</body>
</html>`;
  }

  function buildTrackingHtmlFromForm() {
    const bw = printMode === "BW";
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Arial, sans-serif; margin: 10mm; text-align:center; ${bw ? "filter: grayscale(1);" : ""} }
  .title { font-size:24px; font-weight:900; margin-bottom:12px; }
  .track { font-size:32px; font-weight:900; letter-spacing:2px; margin:18px 0; }
  .box { border:2px solid #000; padding:20px; border-radius:12px; }
  .kv { font-size:14px; line-height:1.6; }
</style>
</head>
<body>
  <div class="title">FIDELIX TRACKING LABEL</div>
  <div class="box">
    <div class="track">${savedTrackingNo}</div>
    <div class="kv">Receipt No: ${savedReceiptNo}</div>
    <div class="kv">Receiver: ${escapeHtml(receiverName || "—")}</div>
    <div class="kv">Phone: ${escapeHtml(receiverPhone || "—")}</div>
    <div class="kv">Destination: ${escapeHtml(receiverCityCountry || "—")}</div>
  </div>
</body>
</html>`;
  }

  function printHtml(html: string, title: string) {
    const w = window.open("", "_blank", "width=1000,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.title = title;
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  if (!auth) {
    return (
      <div className="container">
        <div className="panel" style={{ maxWidth: 520, margin: "40px auto" }}>
          <h2 style={{ marginTop: 0 }}>Login — Fidelix Billing</h2>

          <div className="label">Username</div>
          <input className="input" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />

          <div style={{ height: 10 }} />
          <div className="label">Password</div>
          <input
            className="input"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          {loginErr && (
            <div className="alertErr" style={{ marginTop: 12 }}>
              <b>Login error:</b> {loginErr}
            </div>
          )}

          <div className="btnRow" style={{ marginTop: 12, justifyContent: "flex-end" }}>
            <button className="btnPrimary" onClick={doLogin}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Fidelix Desktop Billing</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="badge">
            Logged in as <b>{auth.fullName}</b> ({auth.role})
          </div>
          <button className="btnSmall" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="tabs noPrint" style={{ marginTop: 10 }}>
        <button className={`btnSmall ${tab === "NEW" ? "tabActive" : ""}`} onClick={() => setTab("NEW")}>
          New Bill
        </button>
        <button className={`btnSmall ${tab === "RECEIPTS" ? "tabActive" : ""}`} onClick={() => setTab("RECEIPTS")}>
          Receipts
        </button>
        <button className={`btnSmall ${tab === "INVOICE" ? "tabActive" : ""}`} onClick={() => setTab("INVOICE")}>
          Invoice
        </button>
        <button className={`btnSmall ${tab === "ACCOUNT" ? "tabActive" : ""}`} onClick={() => setTab("ACCOUNT")}>
          My Account
        </button>
        {isSuperAdmin && (
          <button className={`btnSmall ${tab === "USERS" ? "tabActive" : ""}`} onClick={() => setTab("USERS")}>
            Users
          </button>
        )}
      </div>

      {err && (
        <div className="alertErr" style={{ marginTop: 10 }}>
          <b>Error:</b> {err}
        </div>
      )}

      {okMsg && (
        <div className="alertOk">
          <b>{okMsg}</b>
        </div>
      )}

      {tab === "NEW" && (
        <div className="grid">
          <div className="panel">
            <h3 className="sectionTitle">
              {editingReceiptNo ? `Edit Receipt — ${editingReceiptNo}` : "New Bill"}
            </h3>

            {editingReceiptNo && (
              <div className="badge" style={{ marginBottom: 10 }}>
                Tracking No: <b>{editingTrackingNo}</b>
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <div className="label">Issued By</div>
              <input className="input" value={issuedBy} readOnly />
            </div>

            <div className="row2" style={{ marginTop: 10 }}>
              <div>
                <div className="label">Customer Name</div>
                <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <div className="label">Customer Phone</div>
                <input className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Customer Address</div>
                <input className="input" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </div>
              <div>
                <div className="label">Customer PAN/VAT</div>
                <input className="input" value={customerPanVat} onChange={(e) => setCustomerPanVat(e.target.value)} />
              </div>
            </div>

            <div className="row2" style={{ marginTop: 10 }}>
              <div>
                <div className="label">Receiver Name</div>
                <input className="input" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
              </div>
              <div>
                <div className="label">Receiver Phone</div>
                <input className="input" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Receiver Address</div>
                <input className="input" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} />
              </div>
              <div>
                <div className="label">City/Country</div>
                <input className="input" value={receiverCityCountry} onChange={(e) => setReceiverCityCountry(e.target.value)} />
              </div>
              <div>
                <div className="label">Postal Code</div>
                <input className="input" value={receiverPostalCode} onChange={(e) => setReceiverPostalCode(e.target.value)} />
              </div>
              <div>
                <div className="label">Receiver Email</div>
                <input className="input" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} />
              </div>
            </div>

            <div className="row2" style={{ marginTop: 10 }}>
              <div>
                <div className="label">Shipment Type</div>
                <select className="select" value={shipmentType} onChange={(e) => setShipmentType(e.target.value)}>
                  <option value="DOCUMENT">DOCUMENT</option>
                  <option value="PARCEL">PARCEL</option>
                  <option value="CARGO">CARGO</option>
                </select>
              </div>
              <div>
                <div className="label">Service Type</div>
                <select className="select" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                  <option value="AIR">AIR</option>
                  <option value="SURFACE">SURFACE</option>
                  <option value="EXPRESS">EXPRESS</option>
                  <option value="ECONOMY">ECONOMY</option>
                </select>
              </div>
              <div>
                <div className="label">Weight (Kg)</div>
                <input className="input" type="number" step="0.001" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
              </div>
              <div>
                <div className="label">Pieces</div>
                <input className="input" type="number" value={pieces} onChange={(e) => setPieces(Number(e.target.value))} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Notes</div>
                <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div>
  <div className="label">Forwarding Number</div>
  <input
    className="input"
    value={forwardingTrackingNo}
    onChange={(e) => setForwardingTrackingNo(e.target.value)}
  />
</div>
<div>
  <div className="label">Official Carrier Tracking Link</div>
  <input
    className="input"
    value={forwardingTrackingUrl}
    onChange={(e) => setForwardingTrackingUrl(e.target.value)}
  />
</div>
            </div>

            <div style={{ marginTop: 10 }} className="row2">
              <div>
                <div className="label">Payment Mode</div>
                <select className="select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="CASH">CASH</option>
                  <option value="BANK">BANK</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </div>
              <div>
                <div className="label">Payment Status</div>
                <select className="select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as "PAID" | "DUE")}>
                  <option value="PAID">PAID</option>
                  <option value="DUE">DUE</option>
                </select>
              </div>
              <div>
                <div className="label">Discount</div>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div>
                <div className="label">Total</div>
                <div className="input">
                  {npr(computed.grand)} {paymentStatus === "DUE" ? `(Due: ${npr(computed.due)})` : ""}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Items</h4>
              <button className="btnSmall" onClick={addItem}>+ Add</button>
            </div>

            <div style={{ marginTop: 10 }}>
              {items.map((it) => (
                <div key={it.id} className="row2" style={{ gridTemplateColumns: "1fr 90px 130px 110px", marginBottom: 10 }}>
                  <input className="input" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} placeholder="Description" />
                  <input className="input" type="number" step="0.01" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} placeholder="Qty" />
                  <input className="input" type="number" step="0.01" value={it.rate} onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} placeholder="Rate" />
                  <div className="input">{npr((Number(it.qty) || 0) * (Number(it.rate) || 0))}</div>
                  <div style={{ gridColumn: "1 / span 4", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btnSmall" onClick={() => removeItem(it.id)} disabled={items.length === 1}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="btnRow" style={{ marginTop: 12, justifyContent: "space-between" }}>
              <div>
                {editingReceiptNo && (
                  <button className="btnSmall" onClick={() => { resetForm(); setIssuedBy(auth?.fullName || ""); }}>
                    Cancel Edit
                  </button>
                )}
              </div>
              <button className="btnPrimary" onClick={createOrUpdateReceipt}>
                {editingReceiptNo ? "Update Receipt" : "Save Receipt"}
              </button>
            </div>
          </div>

          <div className="panel">
            <h3 className="sectionTitle">Preview / Print</h3>

            <div className="row2 noPrint">
              <div>
                <div className="label">Preview Type</div>
                <select
                  className="select"
                  value={activePreview}
                  onChange={(e) => setActivePreview(e.target.value as "RECEIPT" | "TRACKING")}
                >
                  <option value="RECEIPT">Receipt</option>
                  <option value="TRACKING">Tracking</option>
                </select>
              </div>

              <div>
                <div className="label">Print Mode</div>
                <select
                  className="select"
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value as "COLOR" | "BW")}
                >
                  <option value="COLOR">Color</option>
                  <option value="BW">Black & White</option>
                </select>
              </div>
            </div>

            <div className="btnRow noPrint" style={{ marginTop: 10 }}>
              <button
                className="btnGhost"
                onClick={() => {
                  if (!editingReceiptNo) return alert("Save or load a receipt first.");
                  printHtml(buildReceiptHtmlFromForm(), "Receipt");
                }}
              >
                Print Receipt
              </button>

              <button
                className="btnGhost"
                onClick={() => {
                  if (!editingTrackingNo) return alert("Save or load a receipt first.");
                  printHtml(buildTrackingHtmlFromForm(), "Tracking");
                }}
              >
                Print Tracking
              </button>
            </div>

            <div className={`paper ${printMode === "BW" ? "bw" : ""}`} style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img className="logo" src="/logo.png" alt="Fidelix Logo" />
                  <div className="kv">
                    <div style={{ fontWeight: 900 }}>{company.name}</div>
                    {company.address} (Postal: {company.postal})<br />
                    PAN: {company.pan} | Reg: {company.reg}<br />
                    {company.email} | {company.web}
                  </div>
                </div>

                <div className="kv" style={{ textAlign: "right" }}>
                  <div><b>Receipt No:</b> {savedReceiptNo}</div>
                  <div><b>Tracking No:</b> {savedTrackingNo}</div>
                  <div><b>Status:</b> {paymentStatus}</div>
                </div>
              </div>

              <div className="paperTitle" style={{ marginTop: 10 }}>
                {activePreview === "RECEIPT" ? "RECEIPT PREVIEW" : "TRACKING PREVIEW"}
              </div>

              <div className="badge" style={{ marginBottom: 10 }}>
                Tracking No: <b>{savedTrackingNo}</b>
              </div>

              {activePreview === "RECEIPT" ? (
                <>
                  <div className="box2">
                    <div className="box">
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Customer</div>
                      <div className="kv">Name: {customerName || "—"}</div>
                      <div className="kv">Phone: {customerPhone || "—"}</div>
                      <div className="kv">Address: {customerAddress || "—"}</div>
                      <div className="kv">PAN/VAT: {customerPanVat || "—"}</div>
                    </div>

                    <div className="box">
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Receiver</div>
                      <div className="kv">Name: {receiverName || "—"}</div>
                      <div className="kv">Phone: {receiverPhone || "—"}</div>
                      <div className="kv">Address: {receiverAddress || "—"}</div>
                      <div className="kv">City/Country: {receiverCityCountry || "—"}</div>
                      <div className="kv">Postal Code: {receiverPostalCode || "—"}</div>
                      <div className="kv">Email: {receiverEmail || "—"}</div>
                    </div>
                  </div>

                  <div className="box2" style={{ marginTop: 10 }}>
                    <div className="box">
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Shipment</div>
                      <div className="kv">Type: {shipmentType || "—"}</div>
                      <div className="kv">Service: {serviceType || "—"}</div>
                      <div className="kv">Weight: {weightKg || 0} Kg</div>
                      <div className="kv">Pieces: {pieces || 0}</div>
                      <div className="kv">Notes: {notes || "—"}</div>
                      <div className="kv">Forwarding No: {forwardingTrackingNo || "—"}</div>
<div className="kv">Carrier Link: {forwardingTrackingUrl || "—"}</div>
                    </div>

                    <div className="box">
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Billing</div>
                      <div className="kv">Payment Mode: {paymentMode || "—"}</div>
                      <div className="kv">Payment Status: {paymentStatus || "—"}</div>
                      <div className="kv">Issued By: {issuedBy || "—"}</div>
                    </div>
                  </div>

                  <table className="table">
                    <thead>
                      <tr>
                        <th>SN</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => {
                        const amt = (Number(it.qty) || 0) * (Number(it.rate) || 0);
                        return (
                          <tr key={it.id}>
                            <td>{idx + 1}</td>
                            <td>{it.description}</td>
                            <td>{it.qty}</td>
                            <td>{npr(it.rate)}</td>
                            <td>{npr(amt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="totals">
                    <div className="totalsBox">
                      <div className="totalsRow"><span>Subtotal</span><span>{npr(computed.subtotal)}</span></div>
                      <div className="totalsRow"><span>Discount</span><span>{npr(discount)}</span></div>
                      <div className="totalsRow"><span>Grand Total</span><span>{npr(computed.grand)}</span></div>
                      <div className="totalsRow"><span>Due</span><span>{npr(computed.due)}</span></div>
                    </div>
                  </div>

                  <div className="footer3">
                    <div>Thank you for choosing Fidelix Global Logistics.</div>
                    <div className="stamp">
                      Company Stamp<br /><br />
                      Issued By: {issuedBy || "—"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="box" style={{ textAlign: "center", marginTop: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>{savedTrackingNo}</div>
                  <div className="kv" style={{ marginTop: 10 }}>Receipt No: {savedReceiptNo}</div>
                  <div className="kv">Receiver: {receiverName || "—"}</div>
                  <div className="kv">Phone: {receiverPhone || "—"}</div>
                  <div className="kv">Destination: {receiverCityCountry || "—"}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "RECEIPTS" && (
        <div className="grid">
          <div className="panel">
            <h3 className="sectionTitle">Search Receipts</h3>

            <div className="row2">
  <div>
    <div className="label">Receipt No</div>
    <input className="input" value={searchReceiptNo} onChange={(e) => setSearchReceiptNo(e.target.value)} />
  </div>
  <div>
    <div className="label">Tracking No</div>
    <input className="input" value={searchTrackingNo} onChange={(e) => setSearchTrackingNo(e.target.value)} />
  </div>
  <div>
    <div className="label">Phone</div>
    <input className="input" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} />
  </div>
  <div>
    <div className="label">From Date (KTM)</div>
    <input className="input" type="date" value={searchFromDate} onChange={(e) => setSearchFromDate(e.target.value)} />
  </div>
  <div>
    <div className="label">To Date (KTM)</div>
    <input className="input" type="date" value={searchToDate} onChange={(e) => setSearchToDate(e.target.value)} />
  </div>
</div>

            <div className="btnRow" style={{ marginTop: 10, justifyContent: "flex-end" }}>
  <button className="btnSmall" onClick={loadReceipts} disabled={loadingReceipts}>
    {loadingReceipts ? "Loading..." : "Search"}
  </button>
  <button className="btnSmall" onClick={exportReceiptsCsv}>
    Export Excel
  </button>
  <button className="btnSmall" onClick={exportReceiptsPdf}>
    Export PDF
  </button>
</div>
          </div>

          <div className="panel">
            <h3 className="sectionTitle">Receipts List</h3>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginTop: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "150px 160px 1fr 110px 100px 100px", padding: 10, background: "rgba(255,255,255,0.03)", fontWeight: 700 }}>
                <div>Receipt No</div>
                <div>Tracking No</div>
                <div>Customer</div>
                <div>Total</div>
                <div>Status</div>
                <div>Action</div>
              </div>

              <div style={{ maxHeight: 520, overflow: "auto" }}>
                {receipts.map((r) => (
                  <div
                    key={`${r.receiptNo}-${r.trackingNo}`}
                    style={{ display: "grid", gridTemplateColumns: "150px 160px 1fr 110px 100px 100px", padding: 10, borderTop: "1px solid var(--border)" }}
                  >
                    <div style={{ fontWeight: 700 }}>{r.receiptNo}</div>
                    <div>{r.trackingNo}</div>
                    <div>
                      {r.customerName}
                      <div className="muted">{r.customerPhone}</div>
                    </div>
                    <div>{npr(Number(r.total || 0))}</div>
                    <div>{r.paymentStatus}</div>
                    <div>
                      <button className="btnSmall" onClick={() => editReceipt(r.receiptNo)}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}

                {receipts.length === 0 && (
                  <div style={{ padding: 12 }} className="badge">
                    No receipts found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "INVOICE" && <InvoiceTab />}

      {tab === "ACCOUNT" && (
        <div className="grid">
          <div className="panel">
            <h3 className="sectionTitle">My Account</h3>

            <div className="box" style={{ background: "transparent" }}>
              <div className="label">Change Password</div>

              <div className="row2" style={{ marginTop: 10 }}>
                <div>
                  <div className="label">Current password</div>
                  <input className="input" type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} />
                </div>
                <div>
                  <div className="label">New password</div>
                  <input className="input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </div>
                <div>
                  <div className="label">Confirm new password</div>
                  <input className="input" type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} />
                </div>
              </div>

              <div className="btnRow" style={{ marginTop: 10, justifyContent: "flex-end" }}>
                <button className="btnPrimary" onClick={changeMyPassword} disabled={changingPass}>
                  {changingPass ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "USERS" && isSuperAdmin && (
        <div className="grid">
          <div className="panel">
            <h3 className="sectionTitle">Admin: Create User</h3>

            <div className="box" style={{ background: "transparent" }}>
              <div className="row2">
                <div>
                  <div className="label">Username</div>
                  <input className="input" value={newUUsername} onChange={(e) => setNewUUsername(e.target.value)} />
                </div>
                <div>
                  <div className="label">Full name</div>
                  <input className="input" value={newUFullName} onChange={(e) => setNewUFullName(e.target.value)} />
                </div>
                <div>
                  <div className="label">Role</div>
                  <select className="select" value={newURole} onChange={(e) => setNewURole(e.target.value as "STAFF" | "SUPER_ADMIN")}>
                    <option value="STAFF">STAFF</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <div className="label">Password</div>
                  <input className="input" type="password" value={newUPassword} onChange={(e) => setNewUPassword(e.target.value)} />
                </div>
              </div>

              <div className="btnRow" style={{ marginTop: 10, justifyContent: "flex-end" }}>
                <button className="btnPrimary" onClick={createUser} disabled={creatingUser}>
                  {creatingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 className="sectionTitle">Users List</h3>

            <div className="btnRow" style={{ justifyContent: "flex-end" }}>
              <button className="btnSmall" onClick={loadUsers} disabled={loadingUsers}>
                {loadingUsers ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginTop: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 140px 90px", padding: 10, background: "rgba(255,255,255,0.03)", fontWeight: 700 }}>
                <div>Username</div>
                <div>Full name</div>
                <div>Role</div>
                <div>Active</div>
              </div>

              <div style={{ maxHeight: 520, overflow: "auto" }}>
                {users.map((u) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 140px 90px", padding: 10, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 700 }}>{u.username}</div>
                    <div>
                      {u.fullName}
                      <div className="muted">Created: {new Date(u.createdAt).toLocaleString()}</div>
                    </div>
                    <div>{u.role}</div>
                    <div>{u.isActive ? "YES" : "NO"}</div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div style={{ padding: 12 }} className="badge">
                    No users found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}