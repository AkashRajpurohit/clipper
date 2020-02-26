// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote } = require('electron')

const init = () => {
    window.checkClipboard = () => {
        return remote.clipboard.readText();
    }
}

init()