// Modules to control application life and create native browser window
const { 
  app, 
  BrowserWindow, 
  Tray, 
  screen,
  ipcMain
} = require('electron')
const path = require('path')
const os = require('os')

let tray = null
let mainWindow = null
const windowWidth = 400
const windowHeight = 500

function setWindowPosition() {
  const { x, y } = tray.getBounds()
  const { width } = screen.getPrimaryDisplay().workAreaSize

  let windowX, windowY

  // Set window X position based on the position of the tray icon
  if (Math.abs(x - width) < windowWidth) {
    windowX = width - windowWidth
  } else {
    windowX = x
  }

  // Set window Y position based on the platform
  if (os.platform() === "win32") {
    windowY = y - windowHeight
  } else {
    windowY = y
  }

  // Top right corner for linux
  // tray.getBounds() API doesn't work as expected
  if(os.platform() === "linux") {
    windowX = width - windowWidth
  }

  // Set window position
  mainWindow.setPosition(windowX, windowY)
}

function createWindow() {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false,
    frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV !== "production"
    }
  })

  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'))

  tray.setToolTip("Click to access Clipper")

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  setWindowPosition()

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  // Set App ID for notifications
  app.setAppUserModelId('com.akash.clipper-desktop')
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Listen for 'open-main-window' event from renderer process
ipcMain.on('open-main-window', () => {
  // Set always on top to true so that
  // mainwindow can be viewed on top of other apps
  mainWindow.setAlwaysOnTop(true)
  // Show the window now
  mainWindow.show()
  // Reset the always on top property
  mainWindow.setAlwaysOnTop(false)
})

ipcMain.on('minimize-app', () => {
  // Hide the main window
  mainWindow.hide();
})

ipcMain.on('quit-app', () => {
  // Quit the app and close all windows
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
