import { useMemo, useState } from "react";

type InvoiceType = "COURIER" | "POST_OFFICE";

type PostOfficeBoxRow = {
  id: string;
  boxRef: string;
  length: string;
  breadth: string;
  height: string;
  volumetricWeight: string;
  actualWeight: string;
  chargedWeight: string;
};

type PostOfficeItemRow = {
  id: string;
  description: string;
  quantity: string;
};

type CourierItemRow = {
  id: string;
  sn: string;
  description: string;
  hsCode: string;
  qty: string;
  unit: string;
  unitValue: string;
  currency: string;
  amount: string;
};

function uid() {
  return crypto.randomUUID();
}

function esc(v: string) {
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

function blankRows(count: number, factory: (idx: number) => string) {
  return Array.from({ length: count }, (_, i) => factory(i)).join("");
}

export default function InvoiceTab() {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("COURIER");

  // ---------- COMMON ----------
  const [printSize, setPrintSize] = useState<"A5" | "A4">("A5");

  // ---------- COURIER (Fidelix_Final...) ----------
  const [cShipperBlock, setCShipperBlock] = useState(
    "Fidelix Global Logistics Pvt. Ltd.\nKhadkagau, Kalanki-14, Kathmandu, Nepal\nPhone/WhatsApp: +977-9700047788 / +977-9851430914\nEmail: logisticsfidelix@gmail.com"
  );
  const [cConsigneeBlock, setCConsigneeBlock] = useState("");
  const [cReceiverPhone, setCReceiverPhone] = useState("");
  const [cReceiverEmail, setCReceiverEmail] = useState("");
  const [cDestinationCountry, setCDestinationCountry] = useState("");
  const [cPieces, setCPieces] = useState("");
  const [cPackageType, setCPackageType] = useState("");
  const [cGrossWeight, setCGrossWeight] = useState("");
  const [cNetWeight, setCNetWeight] = useState("");
  const [cChargeableWeight, setCChargeableWeight] = useState("");
  const [cShipmentDateAD, setCShipmentDateAD] = useState("");
  const [cShipmentDateBS, setCShipmentDateBS] = useState("");
  const [cInvoiceNo, setCInvoiceNo] = useState("");
  const [cModeOfShipment, setCModeOfShipment] = useState("By Air");
  const [cTermsOfPayment, setCTermsOfPayment] = useState("As agreed");
  const [cCountryOfOrigin, setCCountryOfOrigin] = useState("Nepal");
  const [cSubtotal, setCSubtotal] = useState("");
  const [cFreightOther, setCFreightOther] = useState("");
  const [cTotalAmount, setCTotalAmount] = useState("");
  const [cAmountInWords, setCAmountInWords] = useState("");
  const [cReferenceNo, setCReferenceNo] = useState("");
  const [cPreparedBy, setCPreparedBy] = useState("");
  const [cPreparedDate, setCPreparedDate] = useState("");
  const [cAuthorizedName, setCAuthorizedName] = useState("");
  const [cAuthorizedDate, setCAuthorizedDate] = useState("");

  const [cItems, setCItems] = useState<CourierItemRow[]>([
    { id: uid(), sn: "1", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
    { id: uid(), sn: "2", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
    { id: uid(), sn: "3", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
    { id: uid(), sn: "4", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
    { id: uid(), sn: "5", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
    { id: uid(), sn: "6", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
    { id: uid(), sn: "7", description: "", hsCode: "", qty: "", unit: "", unitValue: "", currency: "USD", amount: "" },
  ]);

  // ---------- POST OFFICE ----------
  const [poReceiverName, setPoReceiverName] = useState("");
  const [poReceiverAddress, setPoReceiverAddress] = useState("");
  const [poCountry, setPoCountry] = useState("");
  const [poPostalCode, setPoPostalCode] = useState("");
  const [poContactNo, setPoContactNo] = useState("");
  const [poEmail, setPoEmail] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poCurrentBox, setPoCurrentBox] = useState("1");
  const [poTotalBoxes, setPoTotalBoxes] = useState("1");
  const [poAuthorizedSign, setPoAuthorizedSign] = useState("");

  const [poBoxes, setPoBoxes] = useState<PostOfficeBoxRow[]>([
    {
      id: uid(),
      boxRef: "1 / 1",
      length: "",
      breadth: "",
      height: "",
      volumetricWeight: "",
      actualWeight: "",
      chargedWeight: "",
    },
    {
      id: uid(),
      boxRef: "2 / 2",
      length: "",
      breadth: "",
      height: "",
      volumetricWeight: "",
      actualWeight: "",
      chargedWeight: "",
    },
  ]);

  const [poItems, setPoItems] = useState<PostOfficeItemRow[]>([
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
    { id: uid(), description: "", quantity: "" },
  ]);

  function updateCourierItem(id: string, patch: Partial<CourierItemRow>) {
    setCItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addCourierItem() {
    setCItems((prev) => [
      ...prev,
      {
        id: uid(),
        sn: String(prev.length + 1),
        description: "",
        hsCode: "",
        qty: "",
        unit: "",
        unitValue: "",
        currency: "USD",
        amount: "",
      },
    ]);
  }

  function updatePoBox(id: string, patch: Partial<PostOfficeBoxRow>) {
    setPoBoxes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function updatePoItem(id: string, patch: Partial<PostOfficeItemRow>) {
    setPoItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addPoBox() {
    setPoBoxes((prev) => [
      ...prev,
      {
        id: uid(),
        boxRef: `${prev.length + 1} / ${Math.max(prev.length + 1, Number(poTotalBoxes || "1"))}`,
        length: "",
        breadth: "",
        height: "",
        volumetricWeight: "",
        actualWeight: "",
        chargedWeight: "",
      },
    ]);
  }

  function addPoItem() {
    setPoItems((prev) => [...prev, { id: uid(), description: "", quantity: "" }]);
  }

  const courierHtml = useMemo(() => {
    const rows = cItems
      .map(
        (r) => `
          <tr>
            <td class="center">${esc(r.sn)}</td>
            <td>${esc(r.description)}</td>
            <td class="center">${esc(r.hsCode)}</td>
            <td class="center">${esc(r.qty)}</td>
            <td class="center">${esc(r.unit)}</td>
            <td class="right">${esc(r.unitValue)}</td>
            <td class="center">${esc(r.currency)}</td>
            <td class="right">${esc(r.amount)}</td>
          </tr>
        `
      )
      .join("");

    const missingRows = Math.max(0, 7 - cItems.length);
    const fillerRows = blankRows(
      missingRows,
      (i) => `
        <tr>
          <td class="center">${cItems.length + i + 1}</td>
          <td>&nbsp;</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="center">USD</td>
          <td></td>
        </tr>
      `
    );

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Courier Invoice</title>
        <style>
          @page { size: ${printSize}; margin: 8mm; }
          body { font-family: Arial, Helvetica, sans-serif; color:#111; margin:0; font-size:11px; }
          .page { width:100%; }
          .center { text-align:center; }
          .right { text-align:right; }
          .bold { font-weight:700; }
          .header { text-align:center; }
          .header h1 { margin:0; font-size:16px; letter-spacing:.2px; }
          .header .tag { margin:2px 0 4px; font-size:11px; font-weight:700; }
          .header .meta { margin:1px 0; font-size:10.5px; }
          .title { margin:10px 0 8px; text-align:center; font-size:14px; font-weight:700; letter-spacing:.4px; }
          .triple { display:grid; grid-template-columns: 1.05fr 1.05fr .95fr; gap:8px; }
          .box { border:1px solid #000; min-height:120px; }
          .box .boxtitle {
            padding:5px 6px;
            border-bottom:1px solid #000;
            font-weight:700;
            font-size:10.5px;
            text-transform:uppercase;
          }
          .box .boxbody { padding:6px; white-space:pre-line; line-height:1.35; }
          .infogrid { display:grid; grid-template-columns: 1fr; gap:4px; }
          .infogrid .row { display:flex; justify-content:space-between; gap:8px; }
          .infogrid .row span:first-child { font-weight:700; }
          table { width:100%; border-collapse:collapse; }
          .goods { margin-top:8px; }
          .goods th, .goods td {
            border:1px solid #000;
            padding:4px 5px;
            vertical-align:top;
            font-size:10.5px;
          }
          .goods th { text-align:center; font-weight:700; }
          .goods tbody tr td { height:24px; }
          .totals { width:290px; margin-left:auto; margin-top:8px; }
          .totals td {
            border:1px solid #000;
            padding:5px 6px;
            font-size:10.5px;
          }
          .totals td:first-child { font-weight:700; width:62%; }
          .lineblock {
            margin-top:8px;
            border:1px solid #000;
            padding:6px;
            font-size:10.5px;
            line-height:1.35;
          }
          .notes {
            margin-top:8px;
            border:1px solid #000;
            padding:6px;
            font-size:10.3px;
            line-height:1.35;
          }
          .notes .bold { display:block; margin-bottom:4px; }
          .signs { display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:16px; }
          .signbox {
            min-height:72px;
            display:flex;
            flex-direction:column;
            justify-content:flex-end;
            font-size:10.5px;
          }
          .sigline {
            border-top:1px solid #000;
            padding-top:5px;
            line-height:1.45;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>Fidelix Global Logistics Pvt. Ltd.</h1>
            <div class="tag">Delivering Trust World Wide</div>
            <div class="meta">Khadkagau, Kalanki-14, Kathmandu, Nepal</div>
            <div class="meta">PAN: 623531576</div>
            <div class="meta">Phone: +977-9700047788 / +977-9851430914</div>
            <div class="meta">Email: logisticsfidelix@gmail.com</div>
            <div class="meta">Website: www.fidelixglobal.com</div>
          </div>

          <div class="title">INVOICE AND PACKING LIST</div>

          <div class="triple">
            <div class="box">
              <div class="boxtitle">SHIPPER NAME & ADDRESS</div>
              <div class="boxbody">${esc(cShipperBlock)}</div>
            </div>

            <div class="box">
              <div class="boxtitle">CONSIGNEE NAME & ADDRESS</div>
              <div class="boxbody">${esc(cConsigneeBlock)}</div>
            </div>

            <div class="box">
              <div class="boxtitle">SHIPMENT / PACKAGE INFO</div>
              <div class="boxbody">
                <div class="infogrid">
                  <div class="row"><span>Phone:</span><span>${esc(cReceiverPhone)}</span></div>
                  <div class="row"><span>Email:</span><span>${esc(cReceiverEmail)}</span></div>
                  <div class="row"><span>Destination Country:</span><span>${esc(cDestinationCountry)}</span></div>
                  <div class="row"><span>No. of Pieces:</span><span>${esc(cPieces)}</span></div>
                  <div class="row"><span>Package Type:</span><span>${esc(cPackageType)}</span></div>
                  <div class="row"><span>Gross Weight:</span><span>${esc(cGrossWeight)}</span></div>
                  <div class="row"><span>Net Weight:</span><span>${esc(cNetWeight)}</span></div>
                  <div class="row"><span>Chargeable Wt:</span><span>${esc(cChargeableWeight)}</span></div>
                  <div class="row"><span>Shipment Date (AD):</span><span>${esc(cShipmentDateAD)}</span></div>
                  <div class="row"><span>Shipment Date (BS):</span><span>${esc(cShipmentDateBS)}</span></div>
                  <div class="row"><span>Invoice No.:</span><span>${esc(cInvoiceNo)}</span></div>
                  <div class="row"><span>Mode of Shipment:</span><span>${esc(cModeOfShipment)}</span></div>
                  <div class="row"><span>Terms of Payment:</span><span>${esc(cTermsOfPayment)}</span></div>
                  <div class="row"><span>Country of Origin:</span><span>${esc(cCountryOfOrigin)}</span></div>
                </div>
              </div>
            </div>
          </div>

          <table class="goods">
            <thead>
              <tr>
                <th style="width:5%;">SN</th>
                <th style="width:35%;">DESCRIPTION OF GOODS</th>
                <th style="width:11%;">HS CODE</th>
                <th style="width:7%;">QTY</th>
                <th style="width:8%;">UNIT</th>
                <th style="width:12%;">UNIT VALUE (USD)</th>
                <th style="width:9%;">CURRENCY</th>
                <th style="width:13%;">AMOUNT (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              ${fillerRows}
            </tbody>
          </table>

          <table class="totals">
            <tr><td>SUBTOTAL</td><td class="right">${esc(cSubtotal)}</td></tr>
            <tr><td>FREIGHT / OTHER</td><td class="right">${esc(cFreightOther)}</td></tr>
            <tr><td>TOTAL AMOUNT (USD)</td><td class="right">${esc(cTotalAmount)}</td></tr>
          </table>

          <div class="lineblock"><span class="bold">AMOUNT IN WORDS (USD):</span> ${esc(cAmountInWords)}</div>
          <div class="lineblock"><span class="bold">REFERENCE / FORWARDING NO.:</span> ${esc(cReferenceNo)}</div>

          <div class="lineblock">
            <span class="bold">DECLARATION:</span>
            I/We hereby certify that the particulars given above are true and correct, the goods are packed for export / gift / personal use as applicable, and the values declared are fair to the best of my/our knowledge.
          </div>

          <div class="notes">
            <span class="bold">SPECIAL NOTES:</span>
            - Use clear item descriptions<br/>
            - Mention quantity and value<br/>
            - Attach on parcel front side
          </div>

          <div class="signs">
            <div class="signbox">
              <div class="sigline">
                <div><b>Prepared By</b></div>
                <div>Name: ${esc(cPreparedBy)}</div>
                <div>Date: ${esc(cPreparedDate)}</div>
              </div>
            </div>
            <div class="signbox">
              <div class="sigline">
                <div><b>Authorized Signature / Stamp</b></div>
                <div>Name: ${esc(cAuthorizedName)}</div>
                <div>Date: ${esc(cAuthorizedDate)}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }, [
    printSize,
    cShipperBlock,
    cConsigneeBlock,
    cReceiverPhone,
    cReceiverEmail,
    cDestinationCountry,
    cPieces,
    cPackageType,
    cGrossWeight,
    cNetWeight,
    cChargeableWeight,
    cShipmentDateAD,
    cShipmentDateBS,
    cInvoiceNo,
    cModeOfShipment,
    cTermsOfPayment,
    cCountryOfOrigin,
    cItems,
    cSubtotal,
    cFreightOther,
    cTotalAmount,
    cAmountInWords,
    cReferenceNo,
    cPreparedBy,
    cPreparedDate,
    cAuthorizedName,
    cAuthorizedDate,
  ]);

  const postOfficeHtml = useMemo(() => {
    const boxRows = poBoxes
      .map(
        (b) => `
          <tr>
            <td class="center">${esc(b.boxRef)}</td>
            <td class="center">${esc(b.length)}</td>
            <td class="center">${esc(b.breadth)}</td>
            <td class="center">${esc(b.height)}</td>
            <td class="center">${esc(b.volumetricWeight)}</td>
            <td class="center">${esc(b.actualWeight)}</td>
            <td class="center">${esc(b.chargedWeight)}</td>
          </tr>
        `
      )
      .join("");

    const fillerBoxRows = blankRows(
      Math.max(0, 2 - poBoxes.length),
      () => `
        <tr>
          <td class="center">&nbsp;</td>
          <td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
      `
    );

    const itemRows = poItems
      .map(
        (i) => `
          <tr>
            <td>${esc(i.description)}</td>
            <td class="center">${esc(i.quantity)}</td>
          </tr>
        `
      )
      .join("");

    const fillerItemRows = blankRows(
      Math.max(0, 8 - poItems.length),
      () => `
        <tr>
          <td>&nbsp;</td>
          <td></td>
        </tr>
      `
    );

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Post Office Invoice</title>
        <style>
          @page { size: ${printSize}; margin: 10mm; }
          body { font-family: Arial, Helvetica, sans-serif; color:#111; margin:0; font-size:11px; }
          .header { text-align:center; }
          .header h1 { margin:0; font-size:16px; letter-spacing:.2px; }
          .meta { margin:2px 0; font-size:10.5px; }
          .title { text-align:center; margin:14px 0 10px; font-weight:700; font-size:14px; letter-spacing:.4px; }
          .top { display:grid; grid-template-columns: 1fr 150px; gap:10px; align-items:stretch; }
          .box { border:1px solid #000; min-height:92px; }
          .boxtitle {
            padding:5px 6px;
            border-bottom:1px solid #000;
            font-weight:700;
            font-size:10.5px;
          }
          .boxbody { padding:7px; line-height:1.5; }
          table { width:100%; border-collapse:collapse; margin-top:10px; }
          th, td { border:1px solid #000; padding:5px 6px; font-size:10.5px; vertical-align:top; }
          th { text-align:center; font-weight:700; }
          .center { text-align:center; }
          .measure tbody tr td { height:30px; }
          .items tbody tr td { height:24px; }
          .smallnote { margin-top:10px; font-size:10.5px; line-height:1.4; }
          .sign { margin-top:28px; text-align:right; font-size:10.5px; }
          .signline {
            display:inline-block;
            min-width:180px;
            border-top:1px solid #000;
            padding-top:5px;
            text-align:center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FIDELIX GLOBAL LOGISTICS PVT. LTD.</h1>
          <div class="meta">Khadkagaun, Kalanki-14, 44600, Kathmandu, Nepal</div>
          <div class="meta">Office: 9851430913</div>
          <div class="meta">Mobile: (+977) 9700047788, 9851430914</div>
          <div class="meta">Website: fidelixglobal.com | PAN No.: 623531576</div>
        </div>

        <div class="title">CUSTOMER SHIPMENT DECLARATION FORM</div>

        <div class="top">
          <div class="box">
            <div class="boxtitle">Receiver / Delivery Details</div>
            <div class="boxbody">
              <div><b>Name:</b> ${esc(poReceiverName)}</div>
              <div><b>Address:</b> ${esc(poReceiverAddress)}</div>
              <div><b>Country:</b> ${esc(poCountry)} &nbsp;&nbsp; <b>Postal Code:</b> ${esc(poPostalCode)}</div>
              <div><b>Contact No.:</b> ${esc(poContactNo)} &nbsp;&nbsp; <b>Email:</b> ${esc(poEmail)}</div>
            </div>
          </div>

          <div class="box">
            <div class="boxbody" style="padding-top:14px;">
              <div><b>Date</b></div>
              <div style="margin-top:8px;">${esc(poDate)}</div>
              <div style="margin-top:18px;"><b>Current Box</b></div>
              <div style="margin-top:8px;">${esc(poCurrentBox)} / ${esc(poTotalBoxes)}</div>
            </div>
          </div>
        </div>

        <table class="measure">
          <thead>
            <tr>
              <th style="width:14%;">Box Ref</th>
              <th style="width:12%;">Length</th>
              <th style="width:12%;">Breadth</th>
              <th style="width:12%;">Height</th>
              <th style="width:17%;">Volumetric Weight</th>
              <th style="width:16%;">Actual Weight</th>
              <th style="width:17%;">Charged Weight</th>
            </tr>
          </thead>
          <tbody>
            ${boxRows}
            ${fillerBoxRows}
          </tbody>
        </table>

        <table class="items">
          <thead>
            <tr>
              <th>Shipment Content Details</th>
              <th style="width:100px;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            ${fillerItemRows}
          </tbody>
        </table>

        <div class="smallnote">
          <b>Declaration:</b> Each box must carry only one invoice page.<br/>
          Goods are declared as listed above.
        </div>

        <div class="sign">
          <div class="signline">Authorized Sign: ${esc(poAuthorizedSign)}</div>
        </div>
      </body>
      </html>
    `;
  }, [
    printSize,
    poReceiverName,
    poReceiverAddress,
    poCountry,
    poPostalCode,
    poContactNo,
    poEmail,
    poDate,
    poCurrentBox,
    poTotalBoxes,
    poBoxes,
    poItems,
    poAuthorizedSign,
  ]);

  const previewHtml = invoiceType === "COURIER" ? courierHtml : postOfficeHtml;

  function printCurrent() {
    const w = window.open("", "_blank", "width=1100,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(previewHtml);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 350);
  }

  return (
    <div className="grid">
      <div className="panel noPrint">
        <h3 className="sectionTitle">Invoice</h3>

        <div className="row2">
          <div>
            <div className="label">Invoice Type</div>
            <select className="select" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}>
              <option value="COURIER">Courier Invoice</option>
              <option value="POST_OFFICE">Post Office Invoice</option>
            </select>
          </div>

          <div>
            <div className="label">Print Size</div>
            <select className="select" value={printSize} onChange={(e) => setPrintSize(e.target.value as "A5" | "A4")}>
              <option value="A5">A5</option>
              <option value="A4">A4</option>
            </select>
          </div>

          <div className="btnRow" style={{ justifyContent: "flex-end", alignItems: "end" }}>
            <button className="btnPrimary" onClick={printCurrent}>Print Invoice</button>
          </div>
        </div>

        {invoiceType === "COURIER" ? (
          <>
            <div className="hr" />
            <h4 style={{ margin: "0 0 8px 0" }}>Courier Invoice Details</h4>

            <div className="row2">
              <div>
                <div className="label">Shipper Name & Address</div>
                <textarea
                  className="input"
                  style={{ minHeight: 120 }}
                  value={cShipperBlock}
                  onChange={(e) => setCShipperBlock(e.target.value)}
                />
              </div>
              <div>
                <div className="label">Consignee Name & Address</div>
                <textarea
                  className="input"
                  style={{ minHeight: 120 }}
                  value={cConsigneeBlock}
                  onChange={(e) => setCConsigneeBlock(e.target.value)}
                />
              </div>
            </div>

            <div className="row2" style={{ marginTop: 10 }}>
              <div><div className="label">Phone</div><input className="input" value={cReceiverPhone} onChange={(e) => setCReceiverPhone(e.target.value)} /></div>
              <div><div className="label">Email</div><input className="input" value={cReceiverEmail} onChange={(e) => setCReceiverEmail(e.target.value)} /></div>
              <div><div className="label">Destination Country</div><input className="input" value={cDestinationCountry} onChange={(e) => setCDestinationCountry(e.target.value)} /></div>
              <div><div className="label">No. of Pieces</div><input className="input" value={cPieces} onChange={(e) => setCPieces(e.target.value)} /></div>
              <div><div className="label">Package Type</div><input className="input" value={cPackageType} onChange={(e) => setCPackageType(e.target.value)} /></div>
              <div><div className="label">Gross Weight</div><input className="input" value={cGrossWeight} onChange={(e) => setCGrossWeight(e.target.value)} /></div>
              <div><div className="label">Net Weight</div><input className="input" value={cNetWeight} onChange={(e) => setCNetWeight(e.target.value)} /></div>
              <div><div className="label">Chargeable Weight</div><input className="input" value={cChargeableWeight} onChange={(e) => setCChargeableWeight(e.target.value)} /></div>
              <div><div className="label">Shipment Date (AD)</div><input className="input" value={cShipmentDateAD} onChange={(e) => setCShipmentDateAD(e.target.value)} /></div>
              <div><div className="label">Shipment Date (BS)</div><input className="input" value={cShipmentDateBS} onChange={(e) => setCShipmentDateBS(e.target.value)} /></div>
              <div><div className="label">Invoice No.</div><input className="input" value={cInvoiceNo} onChange={(e) => setCInvoiceNo(e.target.value)} /></div>
              <div><div className="label">Mode of Shipment</div><input className="input" value={cModeOfShipment} onChange={(e) => setCModeOfShipment(e.target.value)} /></div>
              <div><div className="label">Terms of Payment</div><input className="input" value={cTermsOfPayment} onChange={(e) => setCTermsOfPayment(e.target.value)} /></div>
              <div><div className="label">Country of Origin</div><input className="input" value={cCountryOfOrigin} onChange={(e) => setCCountryOfOrigin(e.target.value)} /></div>
            </div>

            <div className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Goods Table</h4>
              <button className="btnSmall" onClick={addCourierItem}>+ Add Row</button>
            </div>

            <div style={{ marginTop: 10 }}>
              {cItems.map((r) => (
                <div
                  key={r.id}
                  className="row2"
                  style={{ gridTemplateColumns: "60px 2fr 1fr 70px 70px 110px 90px 110px", marginBottom: 10 }}
                >
                  <input className="input" placeholder="SN" value={r.sn} onChange={(e) => updateCourierItem(r.id, { sn: e.target.value })} />
                  <input className="input" placeholder="Description" value={r.description} onChange={(e) => updateCourierItem(r.id, { description: e.target.value })} />
                  <input className="input" placeholder="HS Code" value={r.hsCode} onChange={(e) => updateCourierItem(r.id, { hsCode: e.target.value })} />
                  <input className="input" placeholder="Qty" value={r.qty} onChange={(e) => updateCourierItem(r.id, { qty: e.target.value })} />
                  <input className="input" placeholder="Unit" value={r.unit} onChange={(e) => updateCourierItem(r.id, { unit: e.target.value })} />
                  <input className="input" placeholder="Unit Value" value={r.unitValue} onChange={(e) => updateCourierItem(r.id, { unitValue: e.target.value })} />
                  <input className="input" placeholder="Currency" value={r.currency} onChange={(e) => updateCourierItem(r.id, { currency: e.target.value })} />
                  <input className="input" placeholder="Amount" value={r.amount} onChange={(e) => updateCourierItem(r.id, { amount: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="row2" style={{ marginTop: 10 }}>
              <div><div className="label">Subtotal</div><input className="input" value={cSubtotal} onChange={(e) => setCSubtotal(e.target.value)} /></div>
              <div><div className="label">Freight / Other</div><input className="input" value={cFreightOther} onChange={(e) => setCFreightOther(e.target.value)} /></div>
              <div><div className="label">Total Amount</div><input className="input" value={cTotalAmount} onChange={(e) => setCTotalAmount(e.target.value)} /></div>
              <div><div className="label">Amount in Words</div><input className="input" value={cAmountInWords} onChange={(e) => setCAmountInWords(e.target.value)} /></div>
              <div><div className="label">Reference / Forwarding No.</div><input className="input" value={cReferenceNo} onChange={(e) => setCReferenceNo(e.target.value)} /></div>
              <div><div className="label">Prepared By</div><input className="input" value={cPreparedBy} onChange={(e) => setCPreparedBy(e.target.value)} /></div>
              <div><div className="label">Prepared Date</div><input className="input" value={cPreparedDate} onChange={(e) => setCPreparedDate(e.target.value)} /></div>
              <div><div className="label">Authorized Name</div><input className="input" value={cAuthorizedName} onChange={(e) => setCAuthorizedName(e.target.value)} /></div>
              <div><div className="label">Authorized Date</div><input className="input" value={cAuthorizedDate} onChange={(e) => setCAuthorizedDate(e.target.value)} /></div>
            </div>
          </>
        ) : (
          <>
            <div className="hr" />
            <h4 style={{ margin: "0 0 8px 0" }}>Post Office Invoice Details</h4>

            <div className="row2">
              <div>
                <div className="label">Receiver Name</div>
                <input className="input" value={poReceiverName} onChange={(e) => setPoReceiverName(e.target.value)} />
              </div>
              <div>
                <div className="label">Contact No.</div>
                <input className="input" value={poContactNo} onChange={(e) => setPoContactNo(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <div className="label">Receiver Address</div>
                <input className="input" value={poReceiverAddress} onChange={(e) => setPoReceiverAddress(e.target.value)} />
              </div>
              <div>
                <div className="label">Country</div>
                <input className="input" value={poCountry} onChange={(e) => setPoCountry(e.target.value)} />
              </div>
              <div>
                <div className="label">Postal Code</div>
                <input className="input" value={poPostalCode} onChange={(e) => setPoPostalCode(e.target.value)} />
              </div>
              <div>
                <div className="label">Email</div>
                <input className="input" value={poEmail} onChange={(e) => setPoEmail(e.target.value)} />
              </div>
              <div>
                <div className="label">Date</div>
                <input className="input" value={poDate} onChange={(e) => setPoDate(e.target.value)} placeholder="DD / MM / YYYY" />
              </div>
              <div>
                <div className="label">Current Box</div>
                <input className="input" value={poCurrentBox} onChange={(e) => setPoCurrentBox(e.target.value)} />
              </div>
              <div>
                <div className="label">Total Boxes</div>
                <input className="input" value={poTotalBoxes} onChange={(e) => setPoTotalBoxes(e.target.value)} />
              </div>
            </div>

            <div className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Box Measurement & Weight Details</h4>
              <button className="btnSmall" onClick={addPoBox}>+ Add Box</button>
            </div>

            <div style={{ marginTop: 10 }}>
              {poBoxes.map((b) => (
                <div
                  key={b.id}
                  className="row2"
                  style={{ gridTemplateColumns: "100px repeat(6, 1fr)", marginBottom: 10 }}
                >
                  <input className="input" placeholder="Box Ref" value={b.boxRef} onChange={(e) => updatePoBox(b.id, { boxRef: e.target.value })} />
                  <input className="input" placeholder="Length" value={b.length} onChange={(e) => updatePoBox(b.id, { length: e.target.value })} />
                  <input className="input" placeholder="Breadth" value={b.breadth} onChange={(e) => updatePoBox(b.id, { breadth: e.target.value })} />
                  <input className="input" placeholder="Height" value={b.height} onChange={(e) => updatePoBox(b.id, { height: e.target.value })} />
                  <input className="input" placeholder="Volumetric Wt" value={b.volumetricWeight} onChange={(e) => updatePoBox(b.id, { volumetricWeight: e.target.value })} />
                  <input className="input" placeholder="Actual Wt" value={b.actualWeight} onChange={(e) => updatePoBox(b.id, { actualWeight: e.target.value })} />
                  <input className="input" placeholder="Charged Wt" value={b.chargedWeight} onChange={(e) => updatePoBox(b.id, { chargedWeight: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Shipment Content Details</h4>
              <button className="btnSmall" onClick={addPoItem}>+ Add Item</button>
            </div>

            <div style={{ marginTop: 10 }}>
              {poItems.map((i) => (
                <div key={i.id} className="row2" style={{ gridTemplateColumns: "1fr 140px", marginBottom: 10 }}>
                  <input className="input" placeholder="Description" value={i.description} onChange={(e) => updatePoItem(i.id, { description: e.target.value })} />
                  <input className="input" placeholder="Quantity" value={i.quantity} onChange={(e) => updatePoItem(i.id, { quantity: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="hr" />
            <div>
              <div className="label">Authorized Sign</div>
              <input className="input" value={poAuthorizedSign} onChange={(e) => setPoAuthorizedSign(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <h3 className="sectionTitle">Invoice Preview</h3>
        <iframe
          title="Invoice Preview"
          style={{
            width: "100%",
            height: "82vh",
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "#fff",
          }}
          srcDoc={previewHtml}
        />
      </div>
    </div>
  );
}