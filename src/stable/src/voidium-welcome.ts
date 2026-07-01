import * as vscode from 'vscode';

const WELCOME_SHOWN_KEY = 'voidium.welcomeShown';
const WELCOME_VERSION_KEY = 'voidium.welcomeVersion';
const CURRENT_WELCOME_VERSION = '0.1.3';

export class VoidiumWelcomeService {
    private static instance: VoidiumWelcomeService;

    private constructor() {}

    public static getInstance(): VoidiumWelcomeService {
        if (!VoidiumWelcomeService.instance) {
            VoidiumWelcomeService.instance = new VoidiumWelcomeService();
        }
        return VoidiumWelcomeService.instance;
    }

    public async initialize(context: vscode.ExtensionContext): Promise<void> {
        const hasSeenWelcome = context.globalState.get<boolean>(WELCOME_SHOWN_KEY, false);
        const seenVersion = context.globalState.get<string>(WELCOME_VERSION_KEY, '');

        if (!hasSeenWelcome || seenVersion !== CURRENT_WELCOME_VERSION) {
            setTimeout(() => {
                this.showWelcome(context);
            }, 2000);
        }

        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand('voidium.showWelcome', () => {
                this.showWelcome(context);
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('voidium.resetWelcome', async () => {
                await context.globalState.update(WELCOME_SHOWN_KEY, false);
                await context.globalState.update(WELCOME_VERSION_KEY, '');
                vscode.window.showInformationMessage('Voidium Code: Welcome popup will show on next startup.');
            })
        );
    }

    private async showWelcome(context: vscode.ExtensionContext): Promise<void> {
        const message = 'Welcome to Voidium Code! A privacy-focused, telemetry-free code editor. Explore the Voidium theme, auto-updates, and more.';

        const result = await vscode.window.showInformationMessage(
            message,
            { modal: false },
            'Open README',
            'Select Theme',
            'Got It'
        );

        switch (result) {
            case 'Open README':
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/bouclem/Voidium-Code/blob/master/docs/README.md'));
                break;
            case 'Select Theme':
                await vscode.commands.executeCommand('workbench.action.selectTheme');
                break;
            case 'Got It':
            default:
                break;
        }

        await context.globalState.update(WELCOME_SHOWN_KEY, true);
        await context.globalState.update(WELCOME_VERSION_KEY, CURRENT_WELCOME_VERSION);
    }
}

export function activate(context: vscode.ExtensionContext): void {
    const welcomeService = VoidiumWelcomeService.getInstance();
    welcomeService.initialize(context);
}

export function deactivate(): void {
}
