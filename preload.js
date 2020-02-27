// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote, ipcRenderer } = require('electron')

const init = () => {
    window.checkClipboard = () => {
        return remote.clipboard.readText();
    }

    window.copyToClipboard = (text) => {
        remote.clipboard.writeText(text)
    }

    window.openExternalUrl = (url) => {
        remote.shell.openExternal(url)
    }

    window.clearClipboard = () => {
        remote.clipboard.clear()
    }

    window.openMainWindow = () => {
        ipcRenderer.send('open-main-window')
    }
}

init()