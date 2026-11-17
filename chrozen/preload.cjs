const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('chrozen', {
  action: (name, value) => ipcRenderer.send('chrome-action', name, value),
  onTabs: (callback) => ipcRenderer.on('tabs', (_event, tabs, active) => callback(tabs, active))
})
