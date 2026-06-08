# Voidium Code - Task List

> Active development tasks and roadmap items

---

## Current Version: 0.1.1

### Completed
- [x] Rebrand from VSCodium to Voidium Code (0.1.0)
- [x] Remove macOS/Linux build support (Windows-only for now) (0.1.0)
- [x] Create core documentation (README, TODO, CHANGELOG) (0.1.0)
- [x] Bug fixes found via code review:
  - [x] BUG-1: Removed unreachable Linux code block in `prepare_vscode.sh`
  - [x] BUG-2: Fixed `VSCODE_PLATFORM` variable scope in `build.sh`
  - [x] BUG-3: Simplified redundant nested `if` checks in `build.sh`
  - [x] BUG-4: Updated `announcements-extra.json` VSCodium references
  - [x] BUG-5: Fixed `icons/build_icons.sh` VSCodium download URLs
  - [x] BUG-6: Fixed `icons/build_icons.sh` old SVG filename references
- [x] New logo design (SVG format)
  - `icons/stable/voidium.svg` - Dark theme logo
  - `icons/stable/voidium_light.svg` - Light theme logo
  - `icons/insider/voidium_insiders.svg` - Insiders edition

---

## Upcoming Versions

### 0.1.2
- [ ] Add Voidium theme
- [ ] Implement auto-update system:
  - [ ] Check for updates on startup
  - [ ] Prompt user for download
  - [ ] Download and install update
  - [ ] Restart application

### 0.1.3
- [ ] Add welcome popup for first-time users

### 0.1.4
- [ ] Improve startup performance
- [ ] Reduce memory usage

---

## 0.2.0 - AI Features

### Core AI Integration
- [ ] Add AI chat interface
- [ ] Add Ollama support
- [ ] Settings menu for model configuration
- [ ] Model manager

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

## Future (0.?.?)

### Website
- [ ] Landing page
- [ ] Documentation site
- [ ] Download page
- [ ] Changelog page

### Platform Expansion
- [ ] macOS support
- [ ] Linux support

---

## Contributing

Want to help? Check items above and submit PRs!

See [Contributing Guide](old/CONTRIBUTING.md) for guidelines.

---

Last updated: 2026-06-08
