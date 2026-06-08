import * as vscode from 'vscode';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface GitHubRelease {
    tag_name: string;
    name: string;
    prerelease: boolean;
    draft: boolean;
    published_at: string;
    html_url: string;
    assets: Array<{
        name: string;
        browser_download_url: string;
        size: number;
    }>;
}

export class VoidiumAutoUpdateService {
    private static instance: VoidiumAutoUpdateService;
    private readonly GITHUB_API_URL = 'https://api.github.com/repos/bouclem/Voidium-Code/releases';
    private readonly CONFIG_SECTION = 'voidium';
    private readonly CHECK_ON_STARTUP_KEY = 'checkUpdatesOnStartup';
    private currentVersion: string;
    private isInsiders: boolean;

    private constructor() {
        this.currentVersion = vscode.extensions.getExtension('voidware.voidium-code')?.packageJSON.version || '0.0.0';
        this.isInsiders = this.currentVersion.includes('insider') || this.detectInsidersBuild();
    }

    public static getInstance(): VoidiumAutoUpdateService {
        if (!VoidiumAutoUpdateService.instance) {
            VoidiumAutoUpdateService.instance = new VoidiumAutoUpdateService();
        }
        return VoidiumAutoUpdateService.instance;
    }

    private detectInsidersBuild(): boolean {
        // Detect insiders by executable name or other means
        const appName = vscode.env.appName.toLowerCase();
        return appName.includes('insider') || process.argv0.includes('insider');
    }

    public async initialize(): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        const checkOnStartup = config.get<boolean>(this.CHECK_ON_STARTUP_KEY, true);

        if (checkOnStartup) {
            // Check for updates after a short delay to not block startup
            setTimeout(() => {
                this.checkForUpdates();
            }, 5000);
        }

        // Register commands
        this.registerCommands();
    }

    private registerCommands(): void {
        vscode.commands.registerCommand('voidium.checkForUpdates', async () => {
            await this.checkForUpdates(true);
        });

        vscode.commands.registerCommand('voidium.disableAutoUpdateCheck', async () => {
            const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
            await config.update(this.CHECK_ON_STARTUP_KEY, false, true);
            vscode.window.showInformationMessage('Voidium Code: Automatic update checking has been disabled.');
        });
    }

    public async checkForUpdates(showNoUpdateMessage: boolean = false): Promise<void> {
        try {
            const latestRelease = await this.fetchLatestRelease();

            if (!latestRelease) {
                if (showNoUpdateMessage) {
                    vscode.window.showInformationMessage('Voidium Code: No updates available.');
                }
                return;
            }

            const comparison = this.compareVersions(latestRelease.tag_name, this.currentVersion);

            if (comparison <= 0) {
                if (showNoUpdateMessage) {
                    vscode.window.showInformationMessage(`Voidium Code: You are on the latest version (${this.currentVersion}).`);
                }
                return;
            }

            // New version available
            await this.promptForUpdate(latestRelease);

        } catch (error) {
            console.error('[Voidium Auto-Update] Error checking for updates:', error);
            if (showNoUpdateMessage) {
                vscode.window.showErrorMessage(`Voidium Code: Failed to check for updates. ${error}`);
            }
        }
    }

    private async fetchLatestRelease(): Promise<GitHubRelease | null> {
        return new Promise((resolve, reject) => {
            const options: https.RequestOptions = {
                hostname: 'api.github.com',
                path: '/repos/bouclem/Voidium-Code/releases',
                method: 'GET',
                headers: {
                    'User-Agent': 'Voidium-Code-AutoUpdate',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const releases: GitHubRelease[] = JSON.parse(data);

                        // Filter releases based on build type
                        let filteredReleases = releases.filter(r => !r.draft);

                        if (this.isInsiders) {
                            // Insiders: include prereleases (pre-releases)
                            filteredReleases = filteredReleases.filter(r => r.prerelease);
                        } else {
                            // Stable: only non-prerelease versions
                            filteredReleases = filteredReleases.filter(r => !r.prerelease);
                        }

                        // Get the most recent release
                        if (filteredReleases.length > 0) {
                            // Sort by published date, newest first
                            filteredReleases.sort((a, b) =>
                                new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
                            );
                            resolve(filteredReleases[0]);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    private compareVersions(v1: string, v2: string): number {
        // Remove 'v' prefix if present
        v1 = v1.replace(/^v/, '');
        v2 = v2.replace(/^v/, '');

        // Remove '-insider' suffix for comparison
        v1 = v1.replace(/-insider.*$/, '');
        v2 = v2.replace(/-insider.*$/, '');

        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const a = parts1[i] || 0;
            const b = parts2[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    }

    private async promptForUpdate(release: GitHubRelease): Promise<void> {
        const releaseType = release.prerelease ? 'Pre-release' : 'Release';
        const message = `Voidium Code ${releaseType} ${release.tag_name} is available. Current: ${this.currentVersion}`;

        const result = await vscode.window.showInformationMessage(
            message,
            { modal: false },
            'Download & Install',
            'View Release',
            'Later'
        );

        switch (result) {
            case 'Download & Install':
                await this.downloadAndInstallUpdate(release);
                break;
            case 'View Release':
                vscode.env.openExternal(vscode.Uri.parse(release.html_url));
                break;
            case 'Later':
            default:
                // User chose to skip, continue with current version
                break;
        }
    }

    private async downloadAndInstallUpdate(release: GitHubRelease): Promise<void> {
        const platform = os.platform();
        const arch = os.arch();

        // Find appropriate asset
        const asset = this.findAssetForPlatform(release.assets, platform, arch);

        if (!asset) {
            vscode.window.showErrorMessage(
                `Voidium Code: No suitable download found for your platform (${platform} ${arch}). ` +
                `Please download manually from ${release.html_url}`
            );
            return;
        }

        // Show progress
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Downloading Voidium Code ${release.tag_name}`,
            cancellable: false
        }, async (progress) => {
            try {
                const downloadPath = await this.downloadFile(asset.browser_download_url, asset.name, progress);

                // Prompt to install
                const installResult = await vscode.window.showInformationMessage(
                    `Download complete. Install update now? VS Code will restart.`,
                    { modal: true },
                    'Install & Restart',
                    'Install Later'
                );

                if (installResult === 'Install & Restart') {
                    await this.installUpdate(downloadPath);
                }

            } catch (error) {
                vscode.window.showErrorMessage(`Voidium Code: Download failed. ${error}`);
            }
        });
    }

    private findAssetForPlatform(assets: GitHubRelease['assets'], platform: string, arch: string): GitHubRelease['assets'][0] | null {
        // Map platform and arch to expected filename patterns
        const platformMap: Record<string, string> = {
            'win32': 'win32',
            'darwin': 'darwin',
            'linux': 'linux'
        };

        const archMap: Record<string, string> = {
            'x64': 'x64',
            'arm64': 'arm64',
            'ia32': 'ia32'
        };

        const platformKey = platformMap[platform] || platform;
        const archKey = archMap[arch] || arch;

        // Look for matching asset
        for (const asset of assets) {
            const name = asset.name.toLowerCase();
            if (name.includes(platformKey) && name.includes(archKey)) {
                return asset;
            }
        }

        // Fallback: try without arch specification for x64
        if (archKey === 'x64') {
            for (const asset of assets) {
                const name = asset.name.toLowerCase();
                if (name.includes(platformKey) && !name.includes('arm64')) {
                    return asset;
                }
            }
        }

        return null;
    }

    private async downloadFile(url: string, filename: string, progress: vscode.Progress<{ increment: number }>): Promise<string> {
        const downloadsPath = path.join(os.homedir(), 'Downloads');
        const filePath = path.join(downloadsPath, filename);

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filePath);

            https.get(url, { headers: { 'User-Agent': 'Voidium-Code' } }, (response) => {
                const totalSize = parseInt(response.headers['content-length'] || '0', 10);
                let downloadedSize = 0;

                response.on('data', (chunk) => {
                    downloadedSize += chunk.length;
                    file.write(chunk);

                    if (totalSize > 0) {
                        const percent = (downloadedSize / totalSize) * 100;
                        progress.report({ increment: percent / 100 }); // Convert to 0-1 range
                    }
                });

                response.on('end', () => {
                    file.end();
                    resolve(filePath);
                });

                response.on('error', (error) => {
                    file.destroy();
                    fs.unlinkSync(filePath);
                    reject(error);
                });
            }).on('error', (error) => {
                file.destroy();
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                reject(error);
            });
        });
    }

    private async installUpdate(downloadPath: string): Promise<void> {
        const platform = os.platform();

        try {
            if (platform === 'win32') {
                // Windows: Launch installer
                const { exec } = require('child_process');
                exec(`"${downloadPath}" /SILENT`, (error: Error | null) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to launch installer: ${error.message}`);
                    } else {
                        // Close VS Code to allow installation
                        vscode.commands.executeCommand('workbench.action.quit');
                    }
                });
            } else {
                // macOS/Linux: Open file for manual installation
                vscode.env.openExternal(vscode.Uri.file(downloadPath));
                vscode.window.showInformationMessage(
                    'Please complete the installation manually. VS Code will close.'
                );
                setTimeout(() => {
                    vscode.commands.executeCommand('workbench.action.quit');
                }, 3000);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Voidium Code: Installation failed. ${error}`);
        }
    }
}

// Extension activation
export function activate(context: vscode.ExtensionContext): void {
    const updateService = VoidiumAutoUpdateService.getInstance();
    updateService.initialize();

    // Register a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(cloud-download) Voidium";
    statusBarItem.tooltip = "Check for Voidium Code updates";
    statusBarItem.command = 'voidium.checkForUpdates';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
}

export function deactivate(): void {
    // Cleanup if needed
}
