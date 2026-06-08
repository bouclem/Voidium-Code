# Changelog

> All notable changes to Voidium Code will be documented in this file.

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
