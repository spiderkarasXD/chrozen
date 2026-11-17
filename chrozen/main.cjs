const { app, BrowserWindow, WebContentsView, ipcMain } = require('electron')
const { join } = require('node:path')

app.setName('Chrozen')
const chromeFile = join(__dirname, 'index.html')
const sidebarWidth = 246

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 550,
    minHeight: 420,
    backgroundColor: '#212126',
    webPreferences: { preload: join(__dirname, 'preload.cjs'), sandbox: true }
  })
  const tabs = new Map()
  let active
  let nextId = 0
  let chromeReady = false
  const publish = () => {
    if (!chromeReady || win.isDestroyed()) return
    win.webContents.send('tabs', [...tabs.values()].map(({ id, title, url }) => ({ id, title, url })), active)
  }
  const resize = () => {
    const [width, height] = win.getContentSize()
    tabs.get(active)?.view.setBounds({
      x: sidebarWidth, y: 8, width: width - sidebarWidth - 8, height: height - 16
    })
  }
  function select(id) {
    if (!tabs.has(id)) return
    for (const tab of tabs.values()) tab.view.setVisible(tab.id === id)
    active = id
    resize()
    publish()
  }
  function add() {
    const view = new WebContentsView({
      webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false }
    })
    const tab = { id: ++nextId, title: 'New Tab', url: '', view }
    tabs.set(tab.id, tab)
    win.contentView.addChildView(view)
    view.setBackgroundColor('#29292f')
    view.setBorderRadius(10)
    view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    view.webContents.on('page-title-updated', (_event, title) => {
      tab.title = title || 'New Tab'
      publish()
    })
    const onNavigate = (_event, url) => {
      tab.url = url
      publish()
    }
    view.webContents.on('did-navigate', onNavigate)
    view.webContents.on('did-navigate-in-page', onNavigate)
    select(tab.id)
  }
  function close(id) {
    const tab = tabs.get(id)
    if (!tab) return
    win.contentView.removeChildView(tab.view)
    tabs.delete(id)
    tab.view.webContents.close()
    if (!tabs.size) add()
    else if (id === active) select([...tabs.keys()].at(-1))
    publish()
  }
  ipcMain.on('chrome-action', (event, action, value) => {
    if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame) return
    const current = tabs.get(active)?.view.webContents
    if (action === 'new') add()
    if (action === 'select') select(value)
    if (action === 'close') close(value)
    if (action === 'back' && current?.navigationHistory.canGoBack()) current.navigationHistory.goBack()
    if (action === 'forward' && current?.navigationHistory.canGoForward()) current.navigationHistory.goForward()
    if (action === 'reload') current?.reload()
    if (action === 'navigate' && typeof value === 'string') {
      const input = value.trim()
      if (!input) return
      const guess = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : 'https://' + input
      let url
      try { url = new URL(guess) } catch { /* Search text. */ }
      if (!url || !['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) {
        url = new URL('https://www.google.com/search?q=' + encodeURIComponent(input))
      }
      void current?.loadURL(url.href).catch(() => {})
    }
  })
  win.on('resize', resize)
  win.webContents.on('did-finish-load', () => {
    chromeReady = true
    publish()
  })
  win.on('closed', () => {
    for (const { view } of tabs.values()) view.webContents.close()
  })
  void win.loadFile(chromeFile)
  add()
})

app.on('window-all-closed', () => app.quit())
