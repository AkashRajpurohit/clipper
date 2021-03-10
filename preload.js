// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote, ipcRenderer } = require('electron');

const allowedUrls = ['https://akashrajpurohit.com'];

const isValidUrl = url => allowedUrls.includes(url);

const init = () => {
  window.checkClipboard = () => {
    return remote.clipboard.readText();
  };

  window.copyToClipboard = (text) => {
    remote.clipboard.writeText(text);
  };

  window.openExternalUrl = (url) => {
    if (isValidUrl(url)) remote.shell.openExternal(url);
  };

  window.clearClipboard = () => {
    remote.clipboard.clear();
  };

  window.openMainWindow = () => {
    ipcRenderer.send('open-main-window');
  };

  window.minimizeApp = () => {
    ipcRenderer.send('minimize-app');
  };

  window.quitApp = () => {
    ipcRenderer.send('quit-app');
  };
};

init();
