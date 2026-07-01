# Voidium Code - Task List

> Active development tasks and roadmap items

---

## Current Version: 0.2.0

### Completed
- [x] Rebrand from VSCodium to Voidium Code (0.1.0)
- [x] Remove macOS/Linux build support (Windows-only for now) (0.1.0)
- [x] Create core documentation (README, TODO, CHANGELOG) (0.1.0)
- [x] Bug fixes found via code review (0.1.1):
  - [x] BUG-1: Removed unreachable Linux code block in `prepare_vscode.sh`
  - [x] BUG-2: Fixed `VSCODE_PLATFORM` variable scope in `build.sh`
  - [x] BUG-3: Simplified redundant nested `if` checks in `build.sh`
  - [x] BUG-4: Updated `announcements-extra.json` VSCodium references
  - [x] BUG-5: Fixed `icons/build_icons.sh` VSCodium download URLs
  - [x] BUG-6: Fixed `icons/build_icons.sh` old SVG filename references
- [x] New logo design (SVG format) (0.1.1)
  - `icons/stable/voidium.svg` - Dark theme logo
  - `icons/stable/voidium_light.svg` - Light theme logo
  - `icons/insider/voidium_insiders.svg` - Insiders edition
- [x] **Voidium Theme** (0.1.2)
  - `src/stable/resources/voidium-theme.json` - Purple/indigo theme
  - `src/insider/resources/voidium-theme.json` - Cyan-accented insiders variant
- [x] **Auto-Update System** (0.1.2)
  - `src/stable/src/voidium-auto-update.ts` - Stable build update service
  - `src/insider/src/voidium-auto-update.ts` - Insiders update service (prereleases)
  - GitHub Releases API integration
  - Smart filtering: stable builds get releases, insiders get prereleases
  - User prompt: Download & Install / View Release / Later
  - Platform-specific asset selection (Windows x64/ARM64)
  - Progress notification during download
  - Automatic restart after installation
- [x] **Welcome Popup** (0.1.3)
  - `src/stable/src/voidium-welcome.ts` - First-time user welcome for stable
  - `src/insider/src/voidium-welcome.ts` - First-time user welcome for insiders
  - Shows on first launch or when welcome version changes
  - Actions: Open README, Select Theme, Got It
  - Global state tracking to avoid repeated popups
  - Commands: `voidium.showWelcome`, `voidium.resetWelcome`

---

## Upcoming Versions

### 0.2.1
- [ ] GitHub/GitLab integrations
- [ ] OpenRouter and OpenAI-compatible API support
- [ ] LM Studio support
- [ ] AI inline fixes

### 0.2.2
- [ ] AI inline suggestions
- [ ] Chat history
- [ ] Ask mode with file context

### 0.2.3
- [ ] @mentions for files and folders
- [ ] /commands for chat
- [ ] Highlight code to explain/fix

### 0.2.4
- [ ] AI actions (/commands):
  - [ ] Explain code
  - [ ] Optimize code
  - [ ] Fix code
  - [ ] Generate comments
- [ ] Code highlighting support

---

## Completed Versions

### 0.2.0 - AI Features
- [x] Add AI chat interface
  - Sidebar webview chat panel with activity bar icon
  - `src/stable/src/voidium-chat.ts` - Stable chat provider (purple theme)
  - `src/insider/src/voidium-chat.ts` - Insiders chat provider (cyan theme)
  - Streaming responses with token-by-token rendering
  - Cancel button to stop generation mid-stream
  - Chat history maintained in session
- [x] Add Ollama support
  - Default AI provider (localhost:11434)
  - Streaming chat API integration
  - Model list fetching from /api/tags
  - Configurable via `voidium.ai.ollamaUrl` setting
- [x] Settings menu for model configuration
  - VS Code Settings integration (same place as VS Code settings)
  - `voidium.ai.ollamaUrl` - Ollama server URL
  - `voidium.ai.defaultModel` - Default model selection
  - `voidium.ai.temperature` - Response temperature (0-2)
  - Live config reload (URL changes take effect immediately)
- [x] Model manager
  - In-chat model dropdown (select model from available Ollama models)
  - Refresh button to reload model list
  - Model selection persists during session
  - Extension manifest: `voidium-chat-pkg.json` (stable & insider)

---

## Future (0.?.?)

### Optimization Update 1
- [ ] Improve startup performance
- [ ] Reduce memory usage

> **Note**: These items require modifying VS Code core source code, not just the packaging layer. Not planned for active development yet.

### Website
- [ ] Landing page
- [ ] Documentation site
- [ ] Download page
- [ ] Changelog page

### Platform Expansion
- [ ] macOS support
- [ ] Linux support

---

Last updated: 2026-07-01
