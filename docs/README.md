# Voidium Code

> A powerful, open-source code editor based on VS Code.

---

## What is Voidium Code?

**Voidium Code** is a community-driven, telemetry-free code editor forked from VSCodium. It provides all the features you love from Visual Studio Code without the Microsoft-specific components.

## Features

- **Open Source** - Fully open source under MIT license
- **No Telemetry** - No tracking, no data collection
- **Open VSX Registry** - Access to thousands of extensions
- **Windows Native** - Optimized for Windows (x64, arm64)
- **Lightweight** - Fast startup and low memory footprint

## Download

Download the latest release from:
- [GitHub Releases](https://github.com/bouclem/Voidium-Code/releases)

### Supported Platforms

| Platform | Architecture | Status |
|----------|--------------|--------|
| Windows  | x64          | ✓ Supported |
| Windows  | ARM64        | ✓ Supported |
| macOS    | -            | Planned for future |
| Linux    | -            | Planned for future |

## Building from Source

### Prerequisites

- Node.js 20+
- Python 3.11+
- Git

### Build Instructions

```bash
# Clone the repository
git clone https://github.com/bouclem/Voidium-Code.git
cd Voidium-Code

# Set environment variables
export OS_NAME=windows
export VSCODE_ARCH=x64

# Run build
./build.sh
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](old/CONTRIBUTING.md) for details.

## License

[MIT License](../LICENSE) - See LICENSE file for details.

## Acknowledgments

- Based on [VSCodium](https://github.com/VSCodium/vscodium)
- Powered by [VS Code](https://github.com/microsoft/vscode)
- Extensions from [Open VSX](https://open-vsx.org/)

---

**Voidware** © 2026
