const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const Store = require('electron-store');

const store = new Store({
    defaults: {
        theme: 'dark',
        font: 'Inter',
        fontSize: 14,
        lineHeight: 1.6,
        lineHeight: 1.6,
        letterSpacing: 0,
        customBackgroundColor: '#ffffff',
        customTextColor: '#000000',
        recentFiles: []
    }
});

let mainWindow;

function createWindow() {
    const width = store.get('windowBounds.width', 1000);
    const height = store.get('windowBounds.height', 800);

    mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#1E1E1E'
    });

    mainWindow.loadFile('src/index.html');

    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getBounds();
        store.set('windowBounds', { width, height });
    });

    updateMenu();
}

function updateMenu() {
    const recentFiles = store.get('recentFiles') || [];
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const { canceled, filePaths } = await dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'html', 'css'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });
                        if (!canceled) {
                            openFile(filePaths[0]);
                        }
                    }
                },
                {
                    label: 'Open Recent',
                    submenu: [
                        ...(recentFiles.length > 0 ? recentFiles.map(file => ({
                            label: file,
                            click: () => openFile(file)
                        })) : [{ label: 'No Recent Files', enabled: false }]),
                        { type: 'separator' },
                        {
                            label: 'Clear Recent',
                            enabled: recentFiles.length > 0,
                            click: () => clearRecent()
                        }
                    ]
                },
                {
                    label: 'Close File',
                    click: () => mainWindow.webContents.send('app:closeFile')
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        { role: 'editMenu' },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+=',
                    role: 'zoomIn'
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    role: 'zoomOut'
                },
                { type: 'separator' },
                {
                    label: 'Toggle Toolbar',
                    click: () => mainWindow.webContents.send('app:toggleToolbar')
                },
                { role: 'togglefullscreen' },
                { type: 'separator' },
                {
                    label: 'Settings',
                    click: () => mainWindow.webContents.send('app:openSettings')
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function clearRecent() {
    store.set('recentFiles', []);
    updateMenu();
}

function addToRecent(filePath) {
    let recent = store.get('recentFiles') || [];
    recent = recent.filter(f => f !== filePath);
    recent.unshift(filePath);
    if (recent.length > 10) recent.pop();
    store.set('recentFiles', recent);
    updateMenu();
}

async function openFile(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        const detection = jschardet.detect(buffer);
        const encoding = detection.encoding ? detection.encoding : 'utf-8';

        const content = iconv.decode(buffer, encoding);

        addToRecent(filePath);

        if (mainWindow) {
            mainWindow.webContents.send('file-content', { filePath, content });
        }
        return { filePath, content };
    } catch (error) {
        console.error('Failed to read file:', error);
        if (mainWindow) {
            mainWindow.webContents.send('file-error', error.message);
        }
        return { error: error.message };
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    ipcMain.handle('settings:get', (event, key) => {
        return store.get(key);
    });

    ipcMain.handle('settings:set', (event, key, value) => {
        store.set(key, value);
        if (key === 'theme' || key === 'font' || key === 'fontSize') {
            mainWindow.webContents.send('settings-changed', { key, value });
        }
        // Added these listeners in previous turn, keep them consistent if needed for syncing windows or just renderer specific
        if (key === 'lineHeight' || key === 'letterSpacing') {
            mainWindow.webContents.send('settings-changed', { key, value });
        }
        if (key === 'customBackgroundColor' || key === 'customTextColor') {
            mainWindow.webContents.send('settings-changed', { key, value });
        }
    });

    ipcMain.handle('dialog:openFile', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'html', 'css'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        if (canceled) return;
        return openFile(filePaths[0]);
    });

    ipcMain.handle('app:openFilePath', async (event, filePath) => {
        return openFile(filePath);
    });

    ipcMain.handle('app:adjustZoom', (event, delta) => {
        const zoomLevel = mainWindow.webContents.getZoomLevel();
        mainWindow.webContents.setZoomLevel(zoomLevel + delta);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
