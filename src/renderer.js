const btnOpen = document.getElementById('btn-open');
const btnSettings = document.getElementById('btn-settings');
const modal = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('close-settings');
const fileNameDisplay = document.getElementById('file-name');
const fileContentDiv = document.getElementById('file-content');

// Settings Inputs
const themeSelect = document.getElementById('theme-select');
const fontSelect = document.getElementById('font-select');
const fontSizeRange = document.getElementById('font-size-range');
const fontSizeValue = document.getElementById('font-size-value');
const lineHeightRange = document.getElementById('line-height-range');
const lineHeightValue = document.getElementById('line-height-value');
const letterSpacingRange = document.getElementById('letter-spacing-range');
const letterSpacingValue = document.getElementById('letter-spacing-value');
const customColorsGroup = document.getElementById('custom-colors-group');
const customBgColorInput = document.getElementById('custom-bg-color');
const customTextColorInput = document.getElementById('custom-text-color');

// Initial Load
async function init() {
    // Load Settings
    const theme = await window.electronAPI.getSettings('theme') || 'dark';
    const font = await window.electronAPI.getSettings('font') || 'Inter';
    const fontSize = await window.electronAPI.getSettings('fontSize') || 14;
    const lineHeight = await window.electronAPI.getSettings('lineHeight') || 1.6;
    const letterSpacing = await window.electronAPI.getSettings('letterSpacing') || 0;
    const customBg = await window.electronAPI.getSettings('customBackgroundColor') || '#ffffff';
    const customText = await window.electronAPI.getSettings('customTextColor') || '#000000';

    applyTheme(theme, customBg, customText);
    applyFont(font);
    applyFontSize(fontSize);
    applyLineHeight(lineHeight);
    applyLetterSpacing(letterSpacing);

    // Set UI values
    themeSelect.value = theme;
    fontSelect.value = font;
    fontSizeRange.value = fontSize;
    fontSizeValue.textContent = fontSize + 'px';
    if (lineHeightRange) {
        lineHeightRange.value = lineHeight;
        lineHeightValue.textContent = lineHeight;
    }
    if (letterSpacingRange) {
        letterSpacingRange.value = letterSpacing;
        letterSpacingValue.textContent = letterSpacing + 'px';
    }
}

init();

// Event Listeners
btnOpen.addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
    if (result && result.content !== undefined) {
        displayFile(result.filePath, result.content);
    }
});

// Settings Modal
btnSettings.addEventListener('click', () => modal.classList.remove('hidden'));
btnCloseSettings.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// Settings Changes
themeSelect.addEventListener('change', async (e) => {
    const val = e.target.value;
    applyTheme(val);
    await window.electronAPI.setSettings('theme', val);
});

fontSelect.addEventListener('change', async (e) => {
    const val = e.target.value;
    applyFont(val);
    await window.electronAPI.setSettings('font', val);
});

fontSizeRange.addEventListener('input', async (e) => {
    const val = e.target.value;
    fontSizeValue.textContent = val + 'px';
    applyFontSize(val);
    await window.electronAPI.setSettings('fontSize', parseInt(val));
});

if (lineHeightRange) {
    lineHeightRange.addEventListener('input', async (e) => {
        const val = e.target.value;
        lineHeightValue.textContent = val;
        applyLineHeight(val);
        await window.electronAPI.setSettings('lineHeight', parseFloat(val));
    });
}

if (letterSpacingRange) {
    letterSpacingRange.addEventListener('input', async (e) => {
        const val = e.target.value;
        letterSpacingValue.textContent = val + 'px';
        applyLetterSpacing(val);
        await window.electronAPI.setSettings('letterSpacing', parseFloat(val));
    });
}

customBgColorInput.addEventListener('input', async (e) => {
    const val = e.target.value;
    window.electronAPI.setSettings('customBackgroundColor', val);
    applyTheme('custom', val, customTextColorInput.value);
});

customTextColorInput.addEventListener('input', async (e) => {
    const val = e.target.value;
    window.electronAPI.setSettings('customTextColor', val);
    applyTheme('custom', customBgColorInput.value, val);
});

// Application Logic
function applyTheme(theme, customBg, customText) {
    document.body.className = ''; // reset

    if (theme === 'custom') {
        document.body.classList.add('theme-custom');
        customColorsGroup.style.display = 'block';
        if (customBg) {
            document.documentElement.style.setProperty('--bg-color', customBg);
            customBgColorInput.value = customBg;
        }
        if (customText) {
            document.documentElement.style.setProperty('--text-color', customText);
            customTextColorInput.value = customText;
        }
    } else {
        customColorsGroup.style.display = 'none';
        if (theme !== 'dark') document.body.classList.add(`theme-${theme}`);
        // Reset custom vars
        document.documentElement.style.removeProperty('--bg-color');
        document.documentElement.style.removeProperty('--text-color');
    }
}

function applyFont(font) {
    fileContentDiv.style.fontFamily = font === 'KaiTi' ? '"KaiTi", "楷体", serif' : font;
}

function applyFontSize(size) {
    fileContentDiv.style.fontSize = size + 'px';
}

function applyLineHeight(height) {
    fileContentDiv.style.lineHeight = height;
}

function applyLetterSpacing(spacing) {
    fileContentDiv.style.letterSpacing = spacing + 'px';
}

function displayFile(filePath, content) {
    const name = filePath.split(/[\\/]/).pop();
    fileNameDisplay.textContent = name;

    // Clear previous content (including placeholder structure)
    fileContentDiv.innerHTML = '';
    fileContentDiv.textContent = content; // Safely set text content

    if (fileContentDiv.classList.contains('placeholder')) {
        fileContentDiv.classList.remove('placeholder');
    }
}

// Receive content from "Open Recent" menu click
window.electronAPI.onFileContent((event, data) => {
    displayFile(data.filePath, data.content);
});

window.electronAPI.onSettingsChanged((event, { key, value }) => {
    if (key === 'theme') { themeSelect.value = value; applyTheme(value); }
    if (key === 'font') { fontSelect.value = value; applyFont(value); }
    if (key === 'fontSize') {
        fontSizeRange.value = value;
        fontSizeValue.textContent = value + 'px';
        applyFontSize(value);
    }
    if (key === 'lineHeight') {
        if (lineHeightRange) {
            lineHeightRange.value = value;
            lineHeightValue.textContent = value;
        }
        applyLineHeight(value);
    }
    if (key === 'letterSpacing') {
        if (letterSpacingRange) {
            letterSpacingRange.value = value;
            letterSpacingValue.textContent = value + 'px';
        }
        applyLetterSpacing(value);
    }
    if (key === 'customBackgroundColor') {
        customBgColorInput.value = value;
        if (themeSelect.value === 'custom') applyTheme('custom', value, customTextColorInput.value);
    }
    if (key === 'customTextColor') {
        customTextColorInput.value = value;
        if (themeSelect.value === 'custom') applyTheme('custom', customBgColorInput.value, value);
    }
});

// Menu Action Listeners
window.electronAPI.onOpenSettings(() => {
    modal.classList.remove('hidden');
});

window.electronAPI.onCloseFile(() => {
    fileNameDisplay.textContent = '';
    fileContentDiv.textContent = '';
    fileContentDiv.innerHTML = `
        <div class="placeholder-text">
          <p>Open a file to view its content.</p>
          <p class="sub-text">Supported formats: .txt, .md, .json, .js, .html, .css</p>
        </div>
    `;
    fileContentDiv.classList.add('placeholder');
});

window.electronAPI.onToggleToolbar(() => {
    const toolbar = document.querySelector('.toolbar');
    if (toolbar.style.display === 'none') {
        toolbar.style.display = 'flex';
    } else {
        toolbar.style.display = 'none';
    }
});

// Drag and Drop Support
const appContainer = document.querySelector('.app-container');

// Prevent default behavior for all drag events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Visual feedback
['dragenter', 'dragover'].forEach(eventName => {
    document.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    appContainer.style.border = '2px dashed var(--accent-color)';
}

function unhighlight(e) {
    appContainer.style.border = 'none';
}

document.addEventListener('drop', async (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        // Use webUtils via preload to safely get path
        const filePath = window.electronAPI.getFilePath(files[0]);

        if (filePath) {
            const result = await window.electronAPI.openFilePath(filePath);
            if (result && result.content !== undefined) {
                displayFile(result.filePath, result.content);
            }
        }
    }
});

// Zoom Support (Ctrl + Wheel)
document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.5 : 0.5;
        window.electronAPI.adjustZoom(delta);
    }
}, { passive: false });
