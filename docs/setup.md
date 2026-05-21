# Setup & Installation Guide

This guide provides the complete setup, dependencies, running commands, and packaging guidelines for all supported target platforms.

---

## 1. Prerequisites & Tooling

To compile and execute all builds of TranscribeJS, you will need to install the following runtimes:

* **Runtime:** Bun v1.3+ (Do not use Node.js or npm).
* **Desktop Compiler:** Rust toolchain (via `rustup`) for Tauri native compiler.
* **Android Tools:** Android SDK + Command Line Tools (or Android Studio) for mobile compilation.
* **Containers:** Docker runtime for packaging and hosting the web container.

---

## 2. Linux System Dependencies

On Arch Linux (the primary build target), install the required system libraries for Tauri (Webkit2Gtk webview) and cpal (audio recording) before building:

```bash
sudo pacman -S --needed base-devel curl wget openssl libsoup webkit2gtk-4.1 alsa-lib pkgconf
```

For Debian/Ubuntu systems:

```bash
sudo apt-get update
sudo apt-get install -y build-essential curl wget libssl-dev libsoup-3.0-dev libwebkit2gtk-4.1-dev libasound2-dev pkg-config
```

---

## 3. Initial Project Setup

Clone the repository and install developer dependencies using Bun:

```bash
# Install packages
bun install
```

---

## 4. Run Development Servers

### Web Application

Start the fast-reload web server (Vite-like bundler configured in `dev.ts`):

```bash
bun run dev
```

The web console will be available at `http://localhost:3000`.

### Tauri Desktop Application

Launch the desktop app with hot-reloading:

```bash
bun run dev:tauri
```

This starts the React bundler and builds the Rust backend in debug mode, mounting the app in a native OS window container.

---

## 5. Build and Deploy Targets

### 5.1 Web (Static Dist & Docker)

Build standard HTML/JS/CSS assets into `./dist/`:

```bash
bun run build
```

To run a production-ready container:

```bash
# Build Docker image
docker build -t transcribejs:web .

# Start container (serves SPA via Bun on port 3000)
docker run --rm -p 3000:3000 transcribejs:web
```

### 5.2 Android (Capacitor)

To compile and sync assets onto Android projects:

```bash
# Build React app and copy assets into capacitor android package
bun run cap:sync
```

You can open the project inside Android Studio:

```bash
bunx cap open android
```

To run and debug directly on a connected device via Android Debug Bridge (ADB):

```bash
bun run build:adb
```
*Note: This command builds a debug package `com.speechforge.app.debug`, installs it, launches the app, prints console outputs, and automatically uninstalls the debug build when stopped (Ctrl+C).*

### 5.3 Arch Linux Package (`PKGBUILD`)

The project contains a [PKGBUILD](file:///home/joel/progetti/SpeechForge/PKGBUILD) configuration to create an Arch Linux native package:

```bash
# Compile and install native Arch Linux package
makepkg -si
```
This script compiles the Tauri binary, copies icons, sets up the desktop launcher file, and registers the application in the system package manager (`pacman`).
