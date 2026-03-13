const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const bwipjs = require("bwip-js");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
    },
  });

  const devUrl = process.env.ELECTRON_DEV_URL;
  if (devUrl) win.loadURL(devUrl);
  else win.loadFile(path.join(__dirname, "../dist/index.html"));
}

async function barcodePngDataUrl(text) {
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale: 3,
    height: 12,
    includetext: false,
  });
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function printHtml({ html, pageSize, landscape }) {
  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true },
  });

  await printWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  await new Promise((resolve, reject) => {
    printWin.webContents.print(
      {
        silent: false,
        printBackground: true,
        landscape: !!landscape,
        pageSize, // string like "A4" OR {width,height} in microns
      },
      (success, errorType) => {
        if (!success) reject(new Error(errorType || "Print failed"));
        else resolve();
      }
    );
  });

  printWin.close();
}

ipcMain.handle("print:receipt", async (_evt, payload) => {
  await printHtml({
    html: payload.html,
    pageSize: payload.pageSize,
    landscape: payload.landscape,
  });
  return { ok: true };
});

ipcMain.handle("print:tracking", async (_evt, payload) => {
  const barcodeUrl = await barcodePngDataUrl(payload.trackingNo);
  const htmlWithBarcode = payload.html.replace("{{BARCODE_DATAURL}}", barcodeUrl);

  await printHtml({
    html: htmlWithBarcode,
    pageSize: payload.pageSize,
    landscape: payload.landscape,
  });
  return { ok: true };
});

ipcMain.handle("print:both", async (_evt, payload) => {
  const barcodeUrl = await barcodePngDataUrl(payload.trackingNo);
  const trackingHtmlWithBarcode = payload.trackingHtml.replace("{{BARCODE_DATAURL}}", barcodeUrl);

  await printHtml({
    html: payload.receiptHtml,
    pageSize: payload.receiptPageSize,
    landscape: payload.receiptLandscape,
  });

  await printHtml({
    html: trackingHtmlWithBarcode,
    pageSize: payload.trackingPageSize,
    landscape: payload.trackingLandscape,
  });

  return { ok: true };
});

app.whenReady().then(() => createWindow());
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});