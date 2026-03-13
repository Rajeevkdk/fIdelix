const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fidelix", {
  printReceipt: (payload) => ipcRenderer.invoke("print:receipt", payload),
  printTracking: (payload) => ipcRenderer.invoke("print:tracking", payload),
  printBoth: (payload) => ipcRenderer.invoke("print:both", payload),
});