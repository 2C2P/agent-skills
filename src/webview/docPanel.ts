import * as vscode from 'vscode';
import { KnowledgeBase } from '../utils/knowledgeBase';

export class DocPanel {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private knowledgeBase: KnowledgeBase) {}

  show(steeringFile: string) {
    const content = this.knowledgeBase.getFile(steeringFile);
    if (!content) {
      vscode.window.showErrorMessage(`Documentation not found: ${steeringFile}`);
      return;
    }

    if (this.panel) {
      this.panel.reveal();
    } else {
      this.panel = vscode.window.createWebviewPanel(
        '2c2pDoc',
        '2C2P Documentation',
        vscode.ViewColumn.One,
        { enableScripts: false }
      );
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }

    this.panel.title = `2C2P: ${steeringFile}`;
    this.panel.webview.html = this.renderHtml(content);
  }

  private renderHtml(markdown: string): string {
    const htmlContent = this.markdownToHtml(markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
      max-width: 900px;
    }
    code {
      background: var(--vscode-textCodeBlock-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
    pre {
      background: var(--vscode-textCodeBlock-background);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code { background: none; padding: 0; }
    h1, h2, h3 { color: var(--vscode-foreground); border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 4px; }
    a { color: var(--vscode-textLink-foreground); }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid var(--vscode-panel-border); padding: 8px; text-align: left; }
    th { background: var(--vscode-editor-lineHighlightBackground); }
    blockquote { border-left: 3px solid var(--vscode-textLink-foreground); margin-left: 0; padding-left: 12px; opacity: 0.8; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }

  private markdownToHtml(md: string): string {
    return md
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }
}
