const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    onFileContent: (callback) => ipcRenderer.on('file-content', callback),
    openFilePath: (path) => ipcRenderer.invoke('app:openFilePath', path),
    getFilePath: (file) => webUtils.getPathForFile(file),
    getSettings: (key) => ipcRenderer.invoke('settings:get', key),
    setSettings: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    onSettingsChanged: (callback) => ipcRenderer.on('settings-changed', callback),

    // Zoom
    adjustZoom: (delta) => ipcRenderer.invoke('app:adjustZoom', delta)
});
