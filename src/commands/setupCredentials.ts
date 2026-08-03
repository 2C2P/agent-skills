import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { detectStack } from '../utils/stackDetector';

const SANDBOX_CREDENTIALS = {
  merchantId: 'JT01',
  secretKey: '7jYcp4FxFdf0',
  baseUrl: 'https://sandbox-pgw.2c2p.com',
};

export async function setupSandboxCredentials() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const stack = await detectStack();

  let fileName: string;
  let content: string;

  switch (stack) {
    case 'nodejs':
    case 'python':
    case 'php':
      fileName = '.env';
      content = `# 2C2P Sandbox Credentials (testing only)\nTWOC2P_MERCHANT_ID=${SANDBOX_CREDENTIALS.merchantId}\nTWOC2P_SECRET_KEY=${SANDBOX_CREDENTIALS.secretKey}\nTWOC2P_BASE_URL=${SANDBOX_CREDENTIALS.baseUrl}\n`;
      break;
    case 'java':
      fileName = 'application-sandbox.properties';
      content = `# 2C2P Sandbox Credentials (testing only)\ntwoc2p.merchant-id=${SANDBOX_CREDENTIALS.merchantId}\ntwoc2p.secret-key=${SANDBOX_CREDENTIALS.secretKey}\ntwoc2p.base-url=${SANDBOX_CREDENTIALS.baseUrl}\n`;
      break;
    case 'dotnet':
      fileName = 'appsettings.Sandbox.json';
      content = JSON.stringify({
        TwoC2P: {
          MerchantId: SANDBOX_CREDENTIALS.merchantId,
          SecretKey: SANDBOX_CREDENTIALS.secretKey,
          BaseUrl: SANDBOX_CREDENTIALS.baseUrl,
        },
      }, null, 2) + '\n';
      break;
    default:
      fileName = '.env';
      content = `# 2C2P Sandbox Credentials (testing only)\nTWOC2P_MERCHANT_ID=${SANDBOX_CREDENTIALS.merchantId}\nTWOC2P_SECRET_KEY=${SANDBOX_CREDENTIALS.secretKey}\nTWOC2P_BASE_URL=${SANDBOX_CREDENTIALS.baseUrl}\n`;
  }

  const filePath = path.join(rootPath, fileName);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `${fileName} already exists. Overwrite?`,
      'Yes',
      'No'
    );
    if (overwrite !== 'Yes') {
      return;
    }
  }

  // Write file
  fs.writeFileSync(filePath, content);

  // Add to .gitignore
  const gitignorePath = path.join(rootPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignore.includes(fileName)) {
      fs.appendFileSync(gitignorePath, `\n# 2C2P credentials\n${fileName}\n`);
    }
  }

  // Open file
  const doc = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(doc);
  vscode.window.showInformationMessage(`✅ 2C2P sandbox credentials created in ${fileName}`);
}
