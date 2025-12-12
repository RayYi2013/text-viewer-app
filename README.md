# Text Viewer App

A modern, premium desktop application for viewing text files, built with **Electron**.

## 🚀 Features

### Core Functionality
-   **File Support**: Open and view common text formats (`.txt`, `.md`, `.json`, `.js`, `.html`, `.css`).
-   **Chinese Support**: Automatic encoding detection (e.g., GBK, UTF-8) to correctly display Chinese characters without mojibake. Includes the **Kaiti (楷体)** font.
-   **Drag & Drop**: Simply drag files onto the window to open them.

### Personalization
-   **Themes**: Choose from **Dark**, **Light**, or **Sepia** modes.
-   **Typography**:
    -   Switch fonts: Sans Serif (Inter), Serif (Merriweather), Monospace (Fira Code), or **Kaiti**.
    -   Adjust **Font Size**, **Line Height**, and **Letter Spacing**.

### Usability
-   **File History**: Quickly access previously opened files via the "File > Open Recent" menu.
-   **Zoom Controls**: Standard Zoom In (`Ctrl/Cmd + +`) and Zoom Out (`Ctrl/Cmd + -`) support.
-   **Window State**: The app remembers your window size and position.

## 🛠️ Technology Stack
-   **Electron**: Framework for cross-platform desktop apps.
-   **Node.js**: Runtime environment.
-   **Dependencies**:
    -   `jschardet`: For robust encoding detection.
    -   `iconv-lite`: For decoding text content.
    -   `electron-store`: For persisting user preferences and history.

## 📦 Installation & Running

1.  **Clone the repository** (or download source):
    ```bash
    git clone https://github.com/RayYi2013/text-viewer-app.git
    cd text-viewer-app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the application**:
    ```bash
    npm start
    ```

## 🏗️ Implementation Details

-   **Main Process (`main.js`)**: Handles window management, native menus, file system operations (read/write), and proper encoding decoding.
-   **Renderer Process (`renderer.js`)**: Manages the UI, settings interactions, and drag-and-drop events.
-   **Preload (`preload.js`)**: Safely bridges the Main and Renderer processes using `contextBridge`.
