import { useEffect, useMemo, useState } from "react";
import "./App.css";

/** Electron preload print bridge (already in your project) */
declare global {
  interface Window {
    fidelix: {
      printReceipt: (p: { html: string; pageSize: any; landscape: boolean }) => Promise<void>;
      printTracking: (p: { html: string; trackingNo: string; pageSize: any; landscape: boolean }) => Promise<void>;
      printBoth: (p: {
        receiptHtml: string;
        trackingHtml: string;
        trackingNo: string;
        receiptPageSize: any;
        receiptLandscape: boolean;
        trackingPageSize: any;
        trackingLandscape: boolean;
      }) => Promise<void>;
    };
  }
}

type LoginInfo = { token: string; username: string; fullName: string; role: "SUPER_ADMIN" | "STAFF" };
type Item = { id: string; description: string; qty: number; rate: number };

type ReceiptRow = {
  receiptNo: string;
  trackingNo: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentStatus: string;
  issuedBy: string;
  receiptDate: string;
};

type ReceiptDetail = {
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
  customer: { name: string; phone: string; address: string; panVat: string | null };
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
  };
  items: Array<{ sn: number; description: string; qty: number; rate: number; amount: number }>;
};

type UserSummary = {
  id: number;
  username: string;
  fullName: string;
  role: "SUPER_ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
};

type SizeChoice = "A4" | "A5" | "A6" | "A7" | "Letter" | "CUSTOM";

function npr(n: number) {
  return new Intl.NumberFormat("en-NP", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);
}
function uuid() {
  return crypto.randomUUID();
}
function escapeHtml(s: string) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
function toMicrons(value: number, unit: "MM" | "IN") {
  return unit === "IN" ? Math.round(value * 25400) : Math.round(value * 1000);
}

// Kathmandu offset (+05:45)
const KTM_OFFSET = "+05:45";
function toKtmStartIso(dateStr: string) {
  return `${dateStr}T00:00:00${KTM_OFFSET}`;
}
function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export default function App() {
  const API = "http://localhost:8080";

  // ===== API helper (always sends JWT) =====
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

  // ===== COMPANY =====
  const company = {
    name: "FIDELIX GLOBAL LOGISTICS PVT. LTD.",
    address: "Khadkagau, Kalanki-14, Kathmandu",
    pan: "623531576",
    reg: "383840/82/83",
    postal: "44600",
    phone1: "+977 9851430914",
    phone2: "+977 9700047788",
    email: "logisticsfidelix@gmail.com",
    web: "fidelixglobal.com",
    senderLocation: "Khadkagau, Kalanki-14, Kathmandu",
  };

  // ===== LOGO (for printing watermark) =====
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/logo.png");
        if (!res.ok) return;
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => setLogoDataUrl(String(reader.result || ""));
        reader.readAsDataURL(blob);
      } catch {}
    })();
  }, []);

  // ===== AUTH =====
  const [auth, setAuth] = useState<LoginInfo | null>(null);
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("fidelix_token");
    const username = localStorage.getItem("fidelix_username");
    const fullName = localStorage.getItem("fidelix_fullName");
    const role = localStorage.getItem("fidelix_role") as any;
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
    setOkMsg("");
    setLoginErr("");
  }

  const isSuperAdmin = auth?.role === "SUPER_ADMIN";

  // ===== TABS =====
  const [tab, setTab] = useState<"NEW" | "RECEIPTS" | "ACCOUNT" | "USERS">("NEW");

  // ===== GLOBAL MESSAGES =====
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  function showOk(msg: string) {
    setOkMsg(msg);
    setTimeout(() => setOkMsg(""), 2500);
  }

  // ===== NEW BILL FORM (FULL) =====
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

  const [shipmentType, setShipmentType] = useState<"DOCUMENT" | "PARCEL" | "CARGO">("PARCEL");
  const [serviceType, setServiceType] = useState<"AIR" | "SURFACE" | "EXPRESS" | "ECONOMY">("AIR");
  const [weightKg, setWeightKg] = useState<number>(1);
  const [pieces, setPieces] = useState<number>(1);
  const [notes, setNotes] = useState("");

  const [paymentMode, setPaymentMode] = useState<"CASH" | "BANK" | "ONLINE">("CASH");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "DUE">("PAID");
  const [discount, setDiscount] = useState<number>(0);

  const [items, setItems] = useState<Item[]>([{ id: uuid(), description: "Shipping Charge", qty: 1, rate: 0 }]);

  const computed = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
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

  const [saving, setSaving] = useState(false);
  const [savedReceiptNo, setSavedReceiptNo] = useState("");
  const [savedTrackingNo, setSavedTrackingNo] = useState("");

  function validateNewBill(): string | null {
    if (!issuedBy.trim()) return "Issued By is missing (login required)";
    if (!customerName.trim()) return "Customer name is required";
    if (!customerPhone.trim()) return "Customer phone is required";
    if (!customerAddress.trim()) return "Customer address is required";
    if (!receiverName.trim()) return "Receiver name is required";
    if (!receiverPhone.trim()) return "Receiver phone is required";
    if (!receiverAddress.trim()) return "Receiver address is required";
    if (!receiverCityCountry.trim()) return "Receiver city/country is required";
    if (!receiverPostalCode.trim()) return "Receiver postal code is required";
    for (const it of items) {
      if (!it.description.trim()) return "Item description required";
      if ((Number(it.qty) || 0) <= 0) return "Item qty must be > 0";
      if ((Number(it.rate) || 0) < 0) return "Item rate cannot be negative";
    }
    return null;
  }

  async function saveReceipt() {
    setErr("");
    setOkMsg("");

    const v = validateNewBill();
    if (v) return setErr(v);

    try {
      setSaving(true);
      const res = await api("/api/receipts", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          customerPanVat: customerPanVat?.trim() ? customerPanVat.trim() : null,

          receiverName,
          receiverPhone,
          receiverAddress,
          receiverCityCountry,
          receiverPostalCode,
          receiverEmail: receiverEmail?.trim() ? receiverEmail.trim() : null,

          shipmentType,
          serviceType,
          weightKg,
          pieces,
          notes,

          paymentMode,
          paymentStatus,
          issuedBy, // backend can override from JWT if you coded that
          discount,

          items: items.map((x) => ({ description: x.description, qty: Number(x.qty), rate: Number(x.rate) })),
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setSavedReceiptNo(json.receiptNo);
      setSavedTrackingNo(json.trackingNo);
      showOk("Saved successfully");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  // ===== PRINT SETTINGS =====
  const [activePreview, setActivePreview] = useState<"RECEIPT" | "TRACKING">("RECEIPT");
  const [printMode, setPrintMode] = useState<"COLOR" | "BW">("COLOR");

  const [receiptSize, setReceiptSize] = useState<SizeChoice>("A5");
  const [trackingSize, setTrackingSize] = useState<SizeChoice>("A5");
  const [receiptLandscape, setReceiptLandscape] = useState(false);
  const [trackingLandscape, setTrackingLandscape] = useState(true);

  const [customUnit, setCustomUnit] = useState<"MM" | "IN">("MM");
  const [customW, setCustomW] = useState<number>(210);
  const [customH, setCustomH] = useState<number>(148);

  function pageSizeValue(choice: SizeChoice) {
    if (choice !== "CUSTOM") return choice;
    return { width: toMicrons(customW, customUnit), height: toMicrons(customH, customUnit) };
  }

  function buildReceiptHtmlFromForm() {
    const bw = printMode === "BW";
    const dateStr = new Date().toLocaleString();
    const logo = logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="logo" />` : "";
    const rows = items
      .map((it, idx) => {
        const amt = (Number(it.qty) || 0) * (Number(it.rate) || 0);
        return `<tr><td>${idx + 1}</td><td>${escapeHtml(it.description)}</td><td>${it.qty}</td><td>${npr(it.rate)}</td><td>${npr(amt)}</td></tr>`;
      })
      .join("");

    return `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  body{ font-family: Arial, sans-serif; margin: 12mm; ${bw ? "filter: grayscale(1);" : ""} }
  .wm{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; opacity:0.06; z-index:-1; }
  .wm img{ width:60%; max-width:500px; }
  .top{ display:flex; justify-content:space-between; gap:12px; }
  .left{ display:flex; gap:10px; align-items:center; }
  .logo{ width:90px; height:50px; object-fit:contain; }
  .kv{ font-size:12px; line-height:1.45; }
  .title{ text-align:center; font-weight:900; margin:12px 0; letter-spacing:1px; }
  .box2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .box{ border:1px solid #ddd; padding:10px; border-radius:10px; }
  table{ width:100%; border-collapse:collapse; margin-top:10px; font-size:12px; }
  th,td{ border-top:1px solid #ddd; padding:8px; }
  th{ background:#f5f7fb; text-align:left; }
  .tot{ margin-top:10px; display:flex; justify-content:flex-end; }
  .totbox{ width:280px; font-size:12px; }
  .row{ display:flex; justify-content:space-between; }
  .footer{ margin-top:14px; display:flex; justify-content:space-between; gap:10px; font-size:12px; }
  .stamp{ border:1px dashed #999; border-radius:10px; padding:10px; width:180px; text-align:center; }
</style></head>
<body>
  <div class="wm">${logoDataUrl ? `<img src="${logoDataUrl}" />` : ""}</div>

  <div class="top">
    <div class="left">
      ${logo}
      <div class="kv">
        <div style="font-weight:900;">${escapeHtml(company.name)}</div>
        ${escapeHtml(company.address)} (Postal: ${company.postal})<br/>
        PAN: ${company.pan} | Reg: ${company.reg}<br/>
        Phone: ${company.phone1}, ${company.phone2}<br/>
        Email: ${company.email} | Web: ${company.web}
      </div>
    </div>
    <div class="kv" style="text-align:right;">
      <div><b>Receipt No:</b> ${escapeHtml(savedReceiptNo || "")}</div>
      <div><b>Date:</b> ${escapeHtml(dateStr)}</div>
      <div><b>Status:</b> ${escapeHtml(paymentStatus)}</div>
    </div>
  </div>

  <div class="title">RECEIPT</div>

  <div class="box2">
    <div class="box">
      <b>Customer</b><br/>
      Name: ${escapeHtml(customerName)}<br/>
      Phone: ${escapeHtml(customerPhone)}<br/>
      Address: ${escapeHtml(customerAddress)}<br/>
      PAN/VAT: ${escapeHtml(customerPanVat || "—")}
    </div>
    <div class="box">
      <b>Receiver</b><br/>
      Name: ${escapeHtml(receiverName)}<br/>
      Phone: ${escapeHtml(receiverPhone)}<br/>
      Address: ${escapeHtml(receiverAddress)}<br/>
      City/Country: ${escapeHtml(receiverCityCountry)}<br/>
      Postal Code: ${escapeHtml(receiverPostalCode)}
    </div>
  </div>

  <div class="kv" style="margin-top:10px;"><b>Tracking No:</b> ${escapeHtml(savedTrackingNo || "")}</div>

  <table>
    <thead><tr><th style="width:45px;">S.N</th><th>Description</th><th style="width:80px;">Qty</th><th style="width:110px;">Rate</th><th style="width:120px;">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="tot">
    <div class="totbox">
      <div class="row"><span>Subtotal</span><b>${npr(computed.subtotal)}</b></div>
      <div class="row"><span>Discount</span><b>${npr(discount)}</b></div>
      <div class="row" style="margin-top:6px; font-size:14px;"><span>Total</span><b>${npr(computed.grand)}</b></div>
      ${paymentStatus === "DUE" ? `<div class="row"><span>Due</span><b>${npr(computed.due)}</b></div>` : ""}
    </div>
  </div>

  <div class="footer">
    <div>Issued By: <b>${escapeHtml(issuedBy)}</b><br/>Signature: ____________</div>
    <div class="stamp">Company Stamp</div>
    <div style="text-align:right;">Thank you for your business!</div>
  </div>
</body></html>`;
  }

  function buildTrackingHtmlFromForm() {
    const bw = printMode === "BW";
    const dateStr = new Date().toLocaleString();
    const logo = logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="logo" />` : "";
    const trackingNo = savedTrackingNo || "";

    return `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  body{ font-family: Arial, sans-serif; margin: 10mm; ${bw ? "filter: grayscale(1);" : ""} }
  .top{ display:flex; justify-content:space-between; gap:12px; }
  .left{ display:flex; gap:10px; align-items:center; }
  .logo{ width:90px; height:50px; object-fit:contain; }
  .kv{ font-size:12px; line-height:1.45; }
  .title{ text-align:center; font-weight:900; margin:10px 0; letter-spacing:1px; }
  .track{ text-align:center; font-size:22px; font-weight:900; }
  .barcodeWrap{ text-align:center; margin:8px 0 2px; }
  .barcode{ height:52px; }
  .box2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
  .box{ border:1px solid #ddd; padding:10px; border-radius:10px; }
</style></head>
<body>
  <div class="top">
    <div class="left">
      ${logo}
      <div class="kv">
        <div style="font-weight:900;">${escapeHtml(company.name)}</div>
        ${company.web}<br/>${company.email}<br/>${company.phone1} / ${company.phone2}
      </div>
    </div>
    <div class="kv" style="text-align:right;">
      <div><b>Date:</b> ${escapeHtml(dateStr)}</div>
      <div><b>Sender Postal:</b> ${company.postal}</div>
    </div>
  </div>

  <div class="title">TRACK YOUR SHIPMENT</div>
  <div class="kv" style="text-align:center;"><b>Tracking No</b></div>
  <div class="track">${escapeHtml(trackingNo)}</div>

  <div class="barcodeWrap">
    <img class="barcode" src="{{BARCODE_DATAURL}}" alt="barcode"/>
  </div>

  <div class="box2">
    <div class="box">
      <b>Sender</b><br/>
      ${escapeHtml(company.name)}<br/>
      Location: ${escapeHtml(company.senderLocation)}<br/>
      Postal Code: ${company.postal}<br/>
      Contact: ${company.phone1}, ${company.phone2}<br/>
      Email: ${company.email}
    </div>
    <div class="box">
      <b>Receiver</b><br/>
      Name: ${escapeHtml(receiverName)}<br/>
      Phone: ${escapeHtml(receiverPhone)}<br/>
      Address: ${escapeHtml(receiverAddress)}<br/>
      City/Country: ${escapeHtml(receiverCityCountry)}<br/>
      Postal Code: ${escapeHtml(receiverPostalCode)}<br/>
      Email: ${escapeHtml(receiverEmail || "—")}
    </div>
  </div>
</body></html>`;
  }

  async function printReceipt(html: string) {
    await window.fidelix.printReceipt({ html, pageSize: pageSizeValue(receiptSize), landscape: receiptLandscape });
  }
  async function printTracking(html: string, trackingNo: string) {
    await window.fidelix.printTracking({ html, trackingNo, pageSize: pageSizeValue(trackingSize), landscape: trackingLandscape });
  }
  async function printBoth(receiptHtml: string, trackingHtml: string, trackingNo: string) {
    await window.fidelix.printBoth({
      receiptHtml,
      trackingHtml,
      trackingNo,
      receiptPageSize: pageSizeValue(receiptSize),
      receiptLandscape,
      trackingPageSize: pageSizeValue(trackingSize),
      trackingLandscape,
    });
  }

  // ===== RECEIPTS TAB =====
  const [rReceiptNo, setRReceiptNo] = useState("");
  const [rTrackingNo, setRTrackingNo] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rFromDate, setRFromDate] = useState("");
  const [rToDate, setRToDate] = useState("");
  const [receiptRows, setReceiptRows] = useState<ReceiptRow[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const [selectedReceiptNo, setSelectedReceiptNo] = useState("");
  const [detail, setDetail] = useState<ReceiptDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  function buildSearchParams() {
    let from = rFromDate.trim();
    let to = rToDate.trim();
    if (from && !to) to = from;
    if (to && !from) from = to;

    const params = new URLSearchParams();
    if (rReceiptNo.trim()) params.set("receiptNo", rReceiptNo.trim());
    if (rTrackingNo.trim()) params.set("trackingNo", rTrackingNo.trim());
    if (rPhone.trim()) params.set("phone", rPhone.trim());

    if (from && to) {
      params.set("fromDt", toKtmStartIso(from));
      params.set("toDt", toKtmStartIso(addDays(to, 1))); // exclusive
    }
    return params;
  }

  async function loadReceiptsAll() {
    setErr("");
    try {
      setLoadingReceipts(true);
      const res = await api("/api/receipts/search");
      if (!res.ok) throw new Error(await res.text());
      setReceiptRows((await res.json()) as ReceiptRow[]);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoadingReceipts(false);
    }
  }

  async function searchReceipts() {
    setErr("");
    try {
      setLoadingReceipts(true);
      const params = buildSearchParams();
      const res = await api(`/api/receipts/search?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      setReceiptRows((await res.json()) as ReceiptRow[]);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoadingReceipts(false);
    }
  }

  async function loadDetail(receiptNo: string) {
    setSelectedReceiptNo(receiptNo);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api(`/api/receipts/by-no/${encodeURIComponent(receiptNo)}`);
      if (!res.ok) throw new Error(await res.text());
      setDetail((await res.json()) as ReceiptDetail);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setDetailLoading(false);
    }
  }

  // Load receipts automatically when opening receipts tab
  useEffect(() => {
    if (tab === "RECEIPTS") {
      loadReceiptsAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ===== ACCOUNT: CHANGE PASSWORD =====
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  async function changeMyPassword() {
    setErr("");
    setOkMsg("");

    if (!curPass.trim()) return setErr("Current password required");
    if (!newPass.trim() || newPass.trim().length < 8) return setErr("New password must be at least 8 chars");
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

  // ===== USERS TAB (SUPER_ADMIN ONLY) =====
  const [newUUsername, setNewUUsername] = useState("");
  const [newUFullName, setNewUFullName] = useState("");
  const [newURole, setNewURole] = useState<"STAFF" | "SUPER_ADMIN">("STAFF");
  const [newUPassword, setNewUPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
    if (!newUPassword.trim() || newUPassword.trim().length < 8) return setErr("Password must be at least 8 chars");

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

  // ===== LOGIN SCREEN =====
  if (!auth) {
    return (
      <div className="container">
        <div className="panel" style={{ maxWidth: 520, margin: "40px auto" }}>
          <h2 style={{ marginTop: 0 }}>Login — Fidelix Billing</h2>

          <div className="label">Username</div>
          <input className="input" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />

          <div style={{ height: 10 }} />
          <div className="label">Password</div>
          <input className="input" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

          {loginErr && (
            <div className="alertErr" style={{ marginTop: 12 }}>
              <b>Login error:</b> {loginErr}
            </div>
          )}

          <div className="btnRow" style={{ marginTop: 12, justifyContent: "flex-end" }}>
            <button className="btnPrimary" onClick={doLogin}>
              Login
            </button>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Default admin: <b>admin</b> / <b>Admin@123</b>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN UI =====
  return (
    <div className="container">
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Fidelix Desktop Billing</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="badge">
            Logged in as <b>{auth.fullName}</b> ({auth.role})
          </div>
          <button className="btnSmall" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tabs noPrint" style={{ marginTop: 10 }}>
        <button className={`btnSmall ${tab === "NEW" ? "tabActive" : ""}`} onClick={() => setTab("NEW")}>
          New Bill
        </button>

        <button className={`btnSmall ${tab === "RECEIPTS" ? "tabActive" : ""}`} onClick={() => setTab("RECEIPTS")}>
          Receipts
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
        <div className="alertOk" style={{ marginTop: 10 }}>
          <b>{okMsg}</b>
        </div>
      )}

      {/* =================== NEW BILL =================== */}
      {tab === "NEW" && (
        <div className="grid">
          <div className="panel noPrint">
            <h3 className="sectionTitle">New Bill</h3>

            <div className="row2">
              <div>
                <div className="label">Issued By</div>
                <input className="input" value={issuedBy} readOnly />
              </div>

              <div>
                <div className="label">Payment</div>
                <div className="row2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <select className="select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)}>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                    <option value="ONLINE">Online</option>
                  </select>
                  <select className="select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)}>
                    <option value="PAID">Paid</option>
                    <option value="DUE">Due</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="label">Discount (NPR)</div>
                <input className="input" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>

              <div>
                <div className="label">Total (NPR)</div>
                <div className="input">
                  {npr(computed.grand)} {paymentStatus === "DUE" ? `(Due: ${npr(computed.due)})` : ""}
                </div>
              </div>
            </div>

            <div className="hr" />

            <h4 style={{ margin: "0 0 8px 0" }}>Customer (Sender)</h4>
            <div className="row2">
              <div>
                <div className="label">Name *</div>
                <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <div className="label">Phone *</div>
                <input className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Address *</div>
                <input className="input" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">PAN/VAT (optional)</div>
                <input className="input" value={customerPanVat} onChange={(e) => setCustomerPanVat(e.target.value)} />
              </div>
            </div>

            <div className="hr" />

            <h4 style={{ margin: "0 0 8px 0" }}>Receiver</h4>
            <div className="row2">
              <div>
                <div className="label">Name *</div>
                <input className="input" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
              </div>
              <div>
                <div className="label">Phone *</div>
                <input className="input" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Address *</div>
                <input className="input" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} />
              </div>
              <div>
                <div className="label">City/Country *</div>
                <input className="input" value={receiverCityCountry} onChange={(e) => setReceiverCityCountry(e.target.value)} />
              </div>
              <div>
                <div className="label">Postal Code *</div>
                <input className="input" value={receiverPostalCode} onChange={(e) => setReceiverPostalCode(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Email (optional)</div>
                <input className="input" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} />
              </div>
            </div>

            <div className="hr" />

            <h4 style={{ margin: "0 0 8px 0" }}>Shipment</h4>
            <div className="row2">
              <div>
                <div className="label">Type</div>
                <select className="select" value={shipmentType} onChange={(e) => setShipmentType(e.target.value as any)}>
                  <option value="DOCUMENT">Document</option>
                  <option value="PARCEL">Parcel</option>
                  <option value="CARGO">Cargo</option>
                </select>
              </div>
              <div>
                <div className="label">Service</div>
                <select className="select" value={serviceType} onChange={(e) => setServiceType(e.target.value as any)}>
                  <option value="AIR">Air</option>
                  <option value="SURFACE">Surface</option>
                  <option value="EXPRESS">Express</option>
                  <option value="ECONOMY">Economy</option>
                </select>
              </div>
              <div>
                <div className="label">Weight (kg)</div>
                <input className="input" type="number" step="0.001" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
              </div>
              <div>
                <div className="label">Pieces</div>
                <input className="input" type="number" step="1" value={pieces} onChange={(e) => setPieces(Number(e.target.value))} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Notes</div>
                <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="hr" />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Items</h4>
              <button className="btnSmall" onClick={addItem}>
                + Add Item
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              {items.map((it) => (
                <div key={it.id} className="row2" style={{ gridTemplateColumns: "1fr 110px 140px 120px", marginBottom: 10 }}>
                  <div>
                    <div className="label">Description</div>
                    <input className="input" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} />
                  </div>
                  <div>
                    <div className="label">Qty</div>
                    <input className="input" type="number" step="0.01" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                  </div>
                  <div>
                    <div className="label">Rate</div>
                    <input className="input" type="number" step="0.01" value={it.rate} onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} />
                  </div>
                  <div>
                    <div className="label">Amount</div>
                    <div className="input" style={{ background: "rgba(255,255,255,0.02)" }}>
                      {npr((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / span 4", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btnSmall" onClick={() => removeItem(it.id)} disabled={items.length === 1}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="btnRow">
              <button className="btnPrimary" onClick={saveReceipt} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {(savedReceiptNo || savedTrackingNo) && (
              <div className="alertOk" style={{ marginTop: 10 }}>
                <b>Saved:</b> Receipt <b>{savedReceiptNo}</b> | Tracking <b>{savedTrackingNo}</b>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="tabs noPrint">
              <button className={`btnSmall ${activePreview === "RECEIPT" ? "tabActive" : ""}`} onClick={() => setActivePreview("RECEIPT")}>
                Receipt Preview
              </button>
              <button className={`btnSmall ${activePreview === "TRACKING" ? "tabActive" : ""}`} onClick={() => setActivePreview("TRACKING")}>
                Tracking Preview
              </button>
              <div style={{ flex: 1 }} />
              <button className={`btnSmall ${printMode === "COLOR" ? "tabActive" : ""}`} onClick={() => setPrintMode("COLOR")}>
                Color
              </button>
              <button className={`btnSmall ${printMode === "BW" ? "tabActive" : ""}`} onClick={() => setPrintMode("BW")}>
                B/W
              </button>
            </div>

            <div className="row2 noPrint" style={{ marginTop: 10 }}>
              <div>
                <div className="label">Receipt size</div>
                <select className="select" value={receiptSize} onChange={(e) => setReceiptSize(e.target.value as any)}>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="A6">A6</option>
                  <option value="A7">A7</option>
                  <option value="Letter">Letter</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
                <label className="badge">
                  <input type="checkbox" checked={receiptLandscape} onChange={(e) => setReceiptLandscape(e.target.checked)} /> Landscape
                </label>
              </div>

              <div>
                <div className="label">Tracking size</div>
                <select className="select" value={trackingSize} onChange={(e) => setTrackingSize(e.target.value as any)}>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="A6">A6</option>
                  <option value="A7">A7</option>
                  <option value="Letter">Letter</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
                <label className="badge">
                  <input type="checkbox" checked={trackingLandscape} onChange={(e) => setTrackingLandscape(e.target.checked)} /> Landscape
                </label>
              </div>
            </div>

            {receiptSize === "CUSTOM" || trackingSize === "CUSTOM" ? (
              <div className="row2 noPrint" style={{ marginTop: 10 }}>
                <div>
                  <div className="label">Custom Unit</div>
                  <select className="select" value={customUnit} onChange={(e) => setCustomUnit(e.target.value as any)}>
                    <option value="MM">MM</option>
                    <option value="IN">IN</option>
                  </select>
                </div>
                <div>
                  <div className="label">Width</div>
                  <input className="input" type="number" value={customW} onChange={(e) => setCustomW(Number(e.target.value))} />
                </div>
                <div>
                  <div className="label">Height</div>
                  <input className="input" type="number" value={customH} onChange={(e) => setCustomH(Number(e.target.value))} />
                </div>
                <div className="badge" style={{ alignSelf: "end" }}>
                  Default A5 works; custom supports any size.
                </div>
              </div>
            ) : null}

            <div className="btnRow noPrint" style={{ marginTop: 10 }}>
              <button
                className="btnGhost"
                onClick={() => {
                  if (!savedReceiptNo || !savedTrackingNo) return alert("Save first to generate numbers.");
                  printReceipt(buildReceiptHtmlFromForm());
                }}
              >
                Print Receipt
              </button>

              <button
                className="btnGhost"
                onClick={() => {
                  if (!savedReceiptNo || !savedTrackingNo) return alert("Save first to generate numbers.");
                  printTracking(buildTrackingHtmlFromForm(), savedTrackingNo);
                }}
              >
                Print Tracking
              </button>

              <button
                className="btnPrimary"
                onClick={() => {
                  if (!savedReceiptNo || !savedTrackingNo) return alert("Save first to generate numbers.");
                  printBoth(buildReceiptHtmlFromForm(), buildTrackingHtmlFromForm(), savedTrackingNo);
                }}
              >
                Print Both
              </button>
            </div>

            {/* Preview box (simple view; print uses HTML) */}
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
                  <div>
                    <b>Receipt No:</b> {savedReceiptNo || "—"}
                  </div>
                  <div>
                    <b>Status:</b> {paymentStatus}
                  </div>
                </div>
              </div>

              <div className="paperTitle" style={{ marginTop: 10 }}>
                {activePreview === "RECEIPT" ? "RECEIPT PREVIEW" : "TRACKING PREVIEW"}
              </div>

              {/* Tracking number section ALWAYS visible */}
              <div className="badge" style={{ marginBottom: 10 }}>
                Tracking No: <b>{savedTrackingNo || "— (after Save)"}</b>
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
                    </div>
                  </div>

                  <table className="table" style={{ marginTop: 10 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 45 }}>S.N</th>
                        <th>Description</th>
                        <th style={{ width: 80 }}>Qty</th>
                        <th style={{ width: 110 }}>Rate</th>
                        <th style={{ width: 120 }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={it.id}>
                          <td>{idx + 1}</td>
                          <td>{it.description || "—"}</td>
                          <td>{it.qty}</td>
                          <td>{npr(it.rate)}</td>
                          <td>{npr((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="totals">
                    <div className="totalsBox">
                      <div className="totalsRow">
                        <span>Subtotal</span>
                        <b>{npr(computed.subtotal)}</b>
                      </div>
                      <div className="totalsRow">
                        <span>Discount</span>
                        <b>{npr(discount)}</b>
                      </div>
                      <div className="totalsRow" style={{ marginTop: 6, fontSize: 14 }}>
                        <span>Total</span>
                        <b>{npr(computed.grand)}</b>
                      </div>
                      {paymentStatus === "DUE" && (
                        <div className="totalsRow">
                          <span>Due</span>
                          <b>{npr(computed.due)}</b>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="footer3" style={{ marginTop: 12 }}>
   <div>
    Issued By: <b>{issuedBy || "—"}</b>
    <br />
    Signature: ____________
  </div>

  <div className="stamp">Company Stamp</div>

  <div style={{ textAlign: "right" }}>Thank you for your business!</div>
</div>
                </>
              ) : (
                <div className="box2" style={{ marginTop: 10 }}>
                  <div className="box">
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Sender</div>
                    <div className="kv">{company.name}</div>
                    <div className="kv">Location: {company.senderLocation}</div>
                    <div className="kv">Postal Code: {company.postal}</div>
                    <div className="kv">Contact: {company.phone1}, {company.phone2}</div>
                    <div className="kv">Email: {company.email}</div>
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================== RECEIPTS =================== */}
      {tab === "RECEIPTS" && (
        <div className="grid">
          <div className="panel noPrint">
            <h3 className="sectionTitle">Receipts</h3>

            <div className="row2">
              <div>
                <div className="label">Receipt No</div>
                <input className="input" value={rReceiptNo} onChange={(e) => setRReceiptNo(e.target.value)} />
              </div>
              <div>
                <div className="label">Tracking No</div>
                <input className="input" value={rTrackingNo} onChange={(e) => setRTrackingNo(e.target.value)} />
              </div>
              <div>
                <div className="label">Customer Phone</div>
                <input className="input" value={rPhone} onChange={(e) => setRPhone(e.target.value)} />
              </div>
              <div>
                <div className="label">From (KTM)</div>
                <input className="input" type="date" value={rFromDate} onChange={(e) => setRFromDate(e.target.value)} />
              </div>
              <div>
                <div className="label">To (KTM)</div>
                <input className="input" type="date" value={rToDate} onChange={(e) => setRToDate(e.target.value)} />
              </div>
              <div className="btnRow" style={{ justifyContent: "flex-start", alignItems: "end" }}>
                <button className="btnSmall" onClick={searchReceipts} disabled={loadingReceipts}>
                  {loadingReceipts ? "Searching..." : "Search"}
                </button>
                <button className="btnSmall" onClick={loadReceiptsAll}>
                  Load All
                </button>
              </div>
            </div>

            <div className="hr" />

            <div className="badge" style={{ marginBottom: 8 }}>
              Showing <b>{receiptRows.length}</b> receipts
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 170px 1fr 120px 110px",
                  padding: 10,
                  background: "rgba(255,255,255,0.03)",
                  fontWeight: 700,
                }}
              >
                <div>Receipt</div>
                <div>Tracking</div>
                <div>Customer</div>
                <div>Total</div>
                <div>Status</div>
              </div>

              <div style={{ maxHeight: 460, overflow: "auto" }}>
                {receiptRows.map((r) => (
                  <div
                    key={r.receiptNo}
                    onClick={() => loadDetail(r.receiptNo)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "160px 170px 1fr 120px 110px",
                      padding: 10,
                      borderTop: "1px solid var(--border)",
                      cursor: "pointer",
                      background: selectedReceiptNo === r.receiptNo ? "rgba(11,95,165,0.12)" : "transparent",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{r.receiptNo}</div>
                    <div>{r.trackingNo}</div>
                    <div>
                      <div>{r.customerName}</div>
                      <div className="badge">
                        {r.customerPhone} • {new Date(r.receiptDate).toLocaleString()}
                      </div>
                      <div className="badge">Issued: {r.issuedBy}</div>
                    </div>
                    <div>{npr(r.total)}</div>
                    <div>{r.paymentStatus}</div>
                  </div>
                ))}

                {receiptRows.length === 0 && <div style={{ padding: 12 }} className="badge">No results.</div>}
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 className="sectionTitle">Receipt Detail</h3>
            {!selectedReceiptNo && <div className="badge">Click a receipt from the left.</div>}
            {detailLoading && <div className="badge">Loading detail…</div>}

            {detail && (
              <>
                <div className="btnRow noPrint" style={{ marginBottom: 10 }}>
                  <button className="btnGhost" onClick={() => printReceipt(buildReceiptHtmlFromForm())}>
                    Reprint (uses current preview)
                  </button>
                  <button className="btnGhost" onClick={() => printTracking(buildTrackingHtmlFromForm(), detail.shipment.trackingNo)}>
                    Reprint Tracking
                  </button>
                </div>

                <div className="badge">
                  Receipt: <b>{detail.receiptNo}</b> • Tracking: <b>{detail.shipment.trackingNo}</b>
                </div>
                <div className="badge" style={{ marginTop: 6 }}>
                  Customer: <b>{detail.customer.name}</b> • {detail.customer.phone}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =================== ACCOUNT =================== */}
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

              <div className="muted">Password must be at least 8 characters.</div>
            </div>
          </div>

          <div className="panel">
            <h3 className="sectionTitle">Notes</h3>
            <div className="badge">
              AWB invoice: we will use MS Word template for now (fast). Later we can automate inside app.
            </div>
          </div>
        </div>
      )}

      {/* =================== USERS (SUPER_ADMIN ONLY) =================== */}
      {tab === "USERS" && isSuperAdmin && (
        <div className="grid">
          <div className="panel">
            <h3 className="sectionTitle">Admin: Create User</h3>

            <div className="box" style={{ background: "transparent" }}>
              <div className="row2">
                <div>
                  <div className="label">Username</div>
                  <input className="input" value={newUUsername} onChange={(e) => setNewUUsername(e.target.value)} placeholder="e.g. ram" />
                </div>
                <div>
                  <div className="label">Full name</div>
                  <input className="input" value={newUFullName} onChange={(e) => setNewUFullName(e.target.value)} placeholder="e.g. Ram Bahadur" />
                </div>
                <div>
                  <div className="label">Role</div>
                  <select className="select" value={newURole} onChange={(e) => setNewURole(e.target.value as any)}>
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

              <div className="muted">Minimum 8 characters.</div>
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

                {users.length === 0 && <div style={{ padding: 12 }} className="badge">No users found.</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}