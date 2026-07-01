# Changelog

> All notable changes to Voidium Code will be documented in this file.

---

## [0.2.0] - 2026-07-01

### New Features
- **AI Chat Interface**: Sidebar chat panel powered by Ollama
  - `src/stable/src/voidium-chat.ts` - Stable chat provider (purple/indigo theme)
  - `src/insider/src/voidium-chat.ts` - Insiders chat provider (cyan theme)
  - `src/stable/src/voidium-chat-pkg.json` - Extension manifest (stable)
  - `src/insider/src/voidium-chat-pkg.json` - Extension manifest (insiders)
  - Activity bar icon for quick access
  - Streaming responses (token-by-token rendering)
  - Cancel button to stop generation mid-stream
  - Session chat history (maintained during session)
  - Enter to send, Shift+Enter for newline
  - Auto-resizing input textarea
- **Ollama Support**: Default AI provider
  - Connects to local Ollama server (default: `http://localhost:11434`)
  - Streaming chat API (`/api/chat`) with NDJSON parsing
  - Model list fetching from `/api/tags`
  - Configurable server URL via `voidium.ai.ollamaUrl`
  - Live config reload (URL changes take effect without restart)
- **Settings Integration**: VS Code Settings panel
  - `voidium.ai.ollamaUrl` - Ollama server URL (default: `http://localhost:11434`)
  - `voidium.ai.defaultModel` - Default model (default: `llama3`)
  - `voidium.ai.temperature` - Response temperature 0-2 (default: 0.7)
- **Model Manager**: In-chat model dropdown
  - Dropdown selector for available Ollama models
  - Refresh button to reload model list
  - Model selection persists during session
- **Commands**:
  - `voidium.openChat` - Open the AI chat sidebar
  - `voidium.clearChat` - Clear chat history

---

## [0.1.3] - 2026-07-01

### New Features
- **Welcome Popup**: First-time user welcome notification
  - `src/stable/src/voidium-welcome.ts` - Welcome service for stable builds
  - `src/insider/src/voidium-welcome.ts` - Welcome service for insiders builds
  - Shows automatically on first launch (2 second delay after startup)
  - Re-shows when welcome version changes (e.g., major updates)
  - Three action buttons:
    - "Open README" - Opens project documentation in browser
    - "Select Theme" - Opens VS Code theme picker to try Voidium theme
    - "Got It" - Dismisses the popup
  - Global state tracking prevents repeated popups
  - Commands:
    - `voidium.showWelcome` - Manually trigger welcome popup
    - `voidium.resetWelcome` - Reset welcome state for next startup

---

## [0.1.2] - 2026-06-08

### New Features
- **Voidium Theme**: Added custom dark theme for Voidium Code
  - `voidium-theme.json` - Main theme with purple/indigo color scheme
  - Dark background (#0F0F1A) with purple accents
  - Optimized syntax highlighting for code readability
  - Terminal colors matching the theme palette
- **Voidium Insiders Theme**: Cyan-accented variant for Insiders builds
  - `voidium-theme.json` (insider version) with cyan (#22D3EE) highlights
  - Darker background (#0A0A12) for distinction
- **Auto-Update System**: GitHub Releases integration
  - Checks for updates on startup (5 second delay to not block startup)
  - Smart release filtering:
    - **Stable builds**: Only see stable releases (non-prerelease)
    - **Insiders builds**: Only see pre-releases (marked as prerelease on GitHub)
  - User prompt with 3 options:
    - "Download & Install" - Downloads and prompts to install
    - "View Release" - Opens release notes in browser
    - "Later" - Skips this update, continues with current version
  - Platform-specific asset selection (Windows x64, ARM64)
  - Progress notification during download
  - Automatic restart after installation
  - Status bar item for manual update check
  - Commands:
    - `voidium.checkForUpdates` - Manual check
    - `voidium.disableAutoUpdateCheck` - Disable automatic checks

---

## [0.1.1] - 2026-06-08

### Bug Fixes
- **BUG-1**: Removed unreachable Linux code block in `prepare_vscode.sh` (lines 247-279)
  - Code was dead due to earlier Windows-only check at lines 193-200
  - Also removed incorrect snapcraft.yaml comment pointing to wrong file
- **BUG-2**: Fixed variable scope issue in `build.sh`
  - Moved `VSCODE_PLATFORM="win32"` outside CI conditional
  - Ensures variable is always set for REH builds even in CI mode
- **BUG-3**: Simplified redundant nested `if` checks in `build.sh`
  - Removed unnecessary `if [[ "${OS_NAME}" == "windows" ]]` (already validated above)
- **BUG-4**: Updated `announcements-extra.json` - still had VSCodium references
  - Changed to Voidium Code welcome announcement
- **BUG-5**: Fixed `icons/build_icons.sh` - still downloading from VSCodium/icons repo
  - Updated URLs to bouclem/Voidium-Code
- **BUG-6**: Fixed `icons/build_icons.sh` - SVG references still using old codium filenames
  - Updated to use new voidium.svg and voidium_light.svg files

### New Features
- **New Logo**: Added SVG logo designs
  - `voidium.svg` - Main dark theme logo with purple/indigo gradient
  - `voidium_light.svg` - Light theme variant
  - `voidium_insiders.svg` - Insiders edition with cyan/purple gradient

---

## [0.1.0] - 2026-06-08

### Major Changes
- **Rebranding**: Complete rebrand from VSCodium to Voidium Code
  - Application name: Voidium Code
  - Binary name: `voidium`
  - Organization: Voidware
  - New GUIDs for Windows installer
  - Updated all URLs to point to bouclem/Voidium-Code

### Platform Support
- **Windows Only**: Removed macOS and Linux build support for this version
  - Windows x64: Supported
  - Windows ARM64: Supported
  - macOS: Planned for future release
  - Linux: Planned for future release

### Documentation
- Added comprehensive README.md
- Added TODO.md with roadmap
- Added CHANGELOG.md (this file)

### Technical Changes
- Updated `utils.sh` with new branding variables
- Updated `prepare_vscode.sh` with all new product identifiers:
  - `nameShort`: Voidium Code
  - `nameLong`: Voidium Code
  - `applicationName`: voidium
  - `dataFolderName`: .voidium
  - `urlProtocol`: voidium
  - `darwinBundleIdentifier`: com.voidware.VoidiumCode
  - `win32AppUserModelId`: Voidware.VoidiumCode
  - `win32DirName`: Voidium Code
  - `win32MutexName`: voidium
  - `win32RegValueName`: VoidiumCode
  - And all associated GUIDs
- Simplified `build.sh` to Windows-only builds

### URLs Updated
- License: `https://github.com/bouclem/Voidium-Code/blob/master/LICENSE`
- Issues: `https://github.com/bouclem/Voidium-Code/issues/new`
- Updates: `https://raw.githubusercontent.com/bouclem/versions/refs/heads/master`
- Downloads: `https://github.com/bouclem/Voidium-Code/releases`

---

## Future Releases

See [TODO.md](TODO.md) for planned features and roadmap.

---

**Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)**
