import * as vscode from 'vscode';
import * as http from 'http';

interface OllamaModel {
    name: string;
    size: number;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

class OllamaClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    public async listModels(): Promise<OllamaModel[]> {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}/api/tags`);
            const req = http.get(url.href, { headers: { 'Accept': 'application/json' } }, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        const models: OllamaModel[] = (parsed.models || []).map((m: { name: string; size: number }) => ({
                            name: m.name,
                            size: m.size,
                        }));
                        resolve(models);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(5000, () => { req.destroy(); reject(new Error('Request timeout')); });
        });
    }

    public async chat(
        model: string,
        messages: ChatMessage[],
        temperature: number,
        onToken: (token: string) => void,
        signal?: { cancelled: boolean }
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}/api/chat`);
            const body = JSON.stringify({
                model,
                messages,
                stream: true,
                options: { temperature },
            });

            const req = http.request(url.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/x-ndjson',
                },
            }, (res) => {
                let buffer = '';
                res.on('data', (chunk) => {
                    if (signal?.cancelled) { req.destroy(); resolve(); return; }
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const json = JSON.parse(line);
                            if (json.message?.content) {
                                onToken(json.message.content);
                            }
                            if (json.done) {
                                resolve();
                                return;
                            }
                        } catch {
                            // Partial JSON, wait for more data
                        }
                    }
                });
                res.on('end', () => resolve());
                res.on('error', reject);
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
}

class VoidiumChatViewProvider implements vscode.WebviewViewProvider {
    private static instance: VoidiumChatViewProvider;
    private view?: vscode.WebviewView;
    private ollama: OllamaClient;
    private chatHistory: ChatMessage[] = [];
    private currentModel: string = '';
    private isGenerating: boolean = false;
    private cancelSignal: { cancelled: boolean } = { cancelled: false };

    private constructor(private context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration('voidium.ai');
        const url = config.get<string>('ollamaUrl', 'http://localhost:11434');
        this.ollama = new OllamaClient(url);
        this.currentModel = config.get<string>('defaultModel', 'llama3');
    }

    public static getInstance(context: vscode.ExtensionContext): VoidiumChatViewProvider {
        if (!VoidiumChatViewProvider.instance) {
            VoidiumChatViewProvider.instance = new VoidiumChatViewProvider(context);
        }
        return VoidiumChatViewProvider.instance;
    }

    public resolveWebviewView(view: vscode.WebviewView): void {
        this.view = view;
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [],
        };
        view.webview.html = this.getHtml(view.webview);
        view.webview.onDidReceiveMessage((msg) => this.handleMessage(msg));
    }

    private async handleMessage(msg: { type: string; [key: string]: unknown }): Promise<void> {
        switch (msg.type) {
            case 'send':
                await this.handleSend(msg.text as string);
                break;
            case 'refreshModels':
                await this.refreshModels();
                break;
            case 'selectModel':
                this.currentModel = msg.model as string;
                break;
            case 'clearChat':
                this.chatHistory = [];
                break;
            case 'cancel':
                this.cancelSignal.cancelled = true;
                break;
        }
    }

    private async refreshModels(): Promise<void> {
        try {
            const models = await this.ollama.listModels();
            const modelNames = models.map(m => m.name);
            this.postMessage({ type: 'models', models: modelNames, current: this.currentModel });
        } catch (error) {
            this.postMessage({ type: 'error', text: `Cannot connect to Ollama. Is it running? (${error})` });
        }
    }

    private async handleSend(text: string): Promise<void> {
        if (this.isGenerating || !text.trim()) return;

        this.isGenerating = true;
        this.cancelSignal = { cancelled: false };
        this.postMessage({ type: 'generating', value: true });

        this.chatHistory.push({ role: 'user', content: text });

        const config = vscode.workspace.getConfiguration('voidium.ai');
        const temperature = config.get<number>('temperature', 0.7);

        this.postMessage({ type: 'assistantStart' });
        let assistantContent = '';

        try {
            await this.ollama.chat(
                this.currentModel,
                this.chatHistory,
                temperature,
                (token) => {
                    assistantContent += token;
                    this.postMessage({ type: 'token', text: token });
                },
                this.cancelSignal
            );

            this.chatHistory.push({ role: 'assistant', content: assistantContent });
        } catch (error) {
            this.postMessage({ type: 'error', text: `Chat error: ${error}` });
        } finally {
            this.isGenerating = false;
            this.postMessage({ type: 'generating', value: false });
        }
    }

    private postMessage(msg: { type: string; [key: string]: unknown }): void {
        this.view?.webview.postMessage(msg);
    }

    private getHtml(webview: vscode.Webview): string {
        const nonce = getNonce();
        const csp = [
            `default-src 'none'`,
            `script-src 'nonce-${nonce}'`,
            `style-src 'nonce-${nonce}'`,
            `font-src ${webview.cspSource}`,
        ].join('; ');

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Voidium AI Chat - Insiders</title>
<style nonce="${nonce}">
:root {
    --void-bg: #0A0A12;
    --void-surface: #12121F;
    --void-border: #1E1E36;
    --void-accent: #22D3EE;
    --void-accent-hover: #06B6D4;
    --void-accent2: #8B5CF6;
    --void-text: #E0E0F0;
    --void-text-dim: #6A6A8A;
    --void-user-bg: #0D2A33;
    --void-assistant-bg: #12121F;
    --void-error: #EF4444;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    background: var(--void-bg);
    color: var(--void-text);
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
    font-size: 13px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}
#header {
    padding: 8px 12px;
    background: var(--void-surface);
    border-bottom: 1px solid var(--void-border);
    display: flex;
    align-items: center;
    gap: 8px;
}
#header h1 {
    font-size: 12px;
    font-weight: 600;
    color: var(--void-accent);
    white-space: nowrap;
}
#modelSelect {
    flex: 1;
    background: var(--void-bg);
    color: var(--void-text);
    border: 1px solid var(--void-border);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    max-width: 140px;
}
#modelSelect:focus { outline: 1px solid var(--void-accent); }
#refreshBtn {
    background: none;
    border: 1px solid var(--void-border);
    color: var(--void-text-dim);
    border-radius: 4px;
    padding: 4px 6px;
    cursor: pointer;
    font-size: 12px;
}
#refreshBtn:hover { color: var(--void-accent); border-color: var(--void-accent); }
#messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.msg {
    padding: 10px 12px;
    border-radius: 8px;
    max-width: 92%;
    word-wrap: break-word;
    white-space: pre-wrap;
    line-height: 1.5;
    animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.msg.user {
    background: var(--void-user-bg);
    align-self: flex-end;
    border: 1px solid var(--void-accent);
}
.msg.assistant {
    background: var(--void-assistant-bg);
    align-self: flex-start;
    border: 1px solid var(--void-border);
}
.msg.error {
    background: rgba(239,68,68,0.15);
    border: 1px solid var(--void-error);
    color: var(--void-error);
    align-self: center;
    font-size: 12px;
}
.msg.system {
    background: transparent;
    color: var(--void-text-dim);
    font-size: 11px;
    font-style: italic;
    align-self: center;
}
#inputArea {
    padding: 8px 12px;
    background: var(--void-surface);
    border-top: 1px solid var(--void-border);
    display: flex;
    gap: 8px;
    align-items: flex-end;
}
#input {
    flex: 1;
    background: var(--void-bg);
    color: var(--void-text);
    border: 1px solid var(--void-border);
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    min-height: 36px;
    max-height: 120px;
    overflow-y: auto;
}
#input:focus { outline: 1px solid var(--void-accent); }
#sendBtn, #cancelBtn {
    background: var(--void-accent);
    color: #000;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
}
#sendBtn:hover, #cancelBtn:hover { background: var(--void-accent-hover); }
#cancelBtn { background: var(--void-error); color: #fff; display: none; }
#cancelBtn:hover { background: #DC2626; }
.typing { color: var(--void-text-dim); font-style: italic; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--void-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--void-accent); }
</style>
</head>
<body>
<div id="header">
<h1>Voidium AI</h1>
<select id="modelSelect" title="Select model"><option value="">Loading...</option></select>
<button id="refreshBtn" title="Refresh models">&#x21bb;</button>
</div>
<div id="messages"></div>
<div id="inputArea">
<textarea id="input" placeholder="Ask anything... (Enter to send, Shift+Enter for newline)" rows="1"></textarea>
<button id="sendBtn">Send</button>
<button id="cancelBtn">Cancel</button>
</div>
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');
const modelSelect = document.getElementById('modelSelect');
const refreshBtn = document.getElementById('refreshBtn');
let currentAssistantEl = null;

function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
}

function setGenerating(isGen) {
    sendBtn.style.display = isGen ? 'none' : 'block';
    cancelBtn.style.display = isGen ? 'block' : 'none';
    inputEl.disabled = false;
}

window.addEventListener('message', (e) => {
    const msg = e.data;
    switch (msg.type) {
        case 'models':
            modelSelect.innerHTML = '';
            if (msg.models.length === 0) {
                modelSelect.innerHTML = '<option value="">No models found</option>';
            } else {
                msg.models.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m; opt.textContent = m;
                    if (m === msg.current) opt.selected = true;
                    modelSelect.appendChild(opt);
                });
            }
            break;
        case 'assistantStart':
            currentAssistantEl = addMsg('assistant', '');
            currentAssistantEl.innerHTML = '<span class="typing">Thinking...</span>';
            break;
        case 'token':
            if (currentAssistantEl) {
                if (currentAssistantEl.querySelector('.typing')) currentAssistantEl.innerHTML = '';
                currentAssistantEl.textContent += msg.text;
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
            break;
        case 'generating':
            setGenerating(msg.value);
            break;
        case 'error':
            addMsg('error', msg.text);
            setGenerating(false);
            break;
    }
});

function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMsg('user', text);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    vscode.postMessage({ type: 'send', text });
}

sendBtn.addEventListener('click', send);
cancelBtn.addEventListener('click', () => { vscode.postMessage({ type: 'cancel' }); });
inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});
inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});
modelSelect.addEventListener('change', () => {
    vscode.postMessage({ type: 'selectModel', model: modelSelect.value });
});
refreshBtn.addEventListener('click', () => { vscode.postMessage({ type: 'refreshModels' }); });
vscode.postMessage({ type: 'refreshModels' });
</script>
</body>
</html>`;
    }
}

function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < 32; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
}

export function activate(context: vscode.ExtensionContext): void {
    const provider = VoidiumChatViewProvider.getInstance(context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('voidium.chatView', provider, {
            webviewOptions: { retainContextWhenHidden: true },
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('voidium.openChat', () => {
            vscode.commands.executeCommand('workbench.view.extension.voidium-chat');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('voidium.clearChat', () => {
            provider['chatHistory'] = [];
            provider['view']?.webview.postMessage({ type: 'clearChat' });
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('voidium.ai.ollamaUrl')) {
                const config = vscode.workspace.getConfiguration('voidium.ai');
                const url = config.get<string>('ollamaUrl', 'http://localhost:11434');
                provider['ollama'] = new OllamaClient(url);
            }
        })
    );
}

export function deactivate(): void {
}
