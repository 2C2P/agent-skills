import * as vscode from 'vscode';
import { KnowledgeBase } from './utils/knowledgeBase';
import { registerChatParticipant } from './chat/participant';
import { MethodsTreeProvider } from './treeview/methodsProvider';
import { DocPanel } from './webview/docPanel';
import { setupSandboxCredentials } from './commands/setupCredentials';

export function activate(context: vscode.ExtensionContext) {
  console.log('[2C2P Payments] Extension activating...');

  // 1. Load knowledge base
  const knowledgeBase = new KnowledgeBase(context.extensionPath);

  // 2. Register Chat Participant (@2c2p)
  registerChatParticipant(context, knowledgeBase);

  // 3. Register Tree View
  const treeProvider = new MethodsTreeProvider();
  vscode.window.registerTreeDataProvider('2c2p-methods', treeProvider);

  // 4. Register Webview Doc Panel
  const docPanel = new DocPanel(knowledgeBase);
  const openDocCmd = vscode.commands.registerCommand('2c2p.openDoc', (steeringFile: string) => {
    docPanel.show(steeringFile);
  });
  context.subscriptions.push(openDocCmd);

  // 5. Register Setup Credentials Command
  const setupCmd = vscode.commands.registerCommand(
    '2c2p.setupSandboxCredentials',
    setupSandboxCredentials
  );
  context.subscriptions.push(setupCmd);

  console.log('[2C2P Payments] Extension activated successfully');
}

export function deactivate() {}
