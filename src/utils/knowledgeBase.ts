import * as path from 'path';
import * as fs from 'fs';

export class KnowledgeBase {
  private files: Map<string, string> = new Map();

  constructor(private extensionPath: string) {
    this.loadFiles();
  }

  private loadFiles() {
    const knowledgeDir = path.join(this.extensionPath, 'knowledge');
    try {
      const entries = fs.readdirSync(knowledgeDir);
      for (const entry of entries) {
        if (entry.endsWith('.md')) {
          const name = entry.replace('.md', '');
          const content = fs.readFileSync(path.join(knowledgeDir, entry), 'utf-8');
          this.files.set(name, content);
        }
      }
      console.log(`[2C2P] Loaded ${this.files.size} knowledge files`);
    } catch (err) {
      console.error('[2C2P] Failed to load knowledge base:', err);
    }
  }

  getFile(name: string): string {
    return this.files.get(name) || '';
  }

  getFileNames(): string[] {
    return Array.from(this.files.keys());
  }

  search(query: string): string {
    const queryLower = query.toLowerCase();
    const keywords: Record<string, string[]> = {
      'quickpay': ['quickpay', 'payment link', 'link', 'no-code'],
      'redirect-integration': ['redirect', 'hosted', 'payment page', 'hpp'],
      'direct-integration': ['direct', 'custom ui', 'card form'],
      'mobile-sdk': ['mobile', 'ios', 'android', 'sdk'],
      'web-sdk': ['web sdk', 'drop-in', 'web component'],
      'payment-apis': ['api', 'payment token', 'do payment', 'inquiry'],
      'payment-maintenance': ['refund', 'void', 'recurring', 'settlement'],
      'getting-started': ['sandbox', 'setup', 'credential', 'start', 'begin'],
      'references': ['test card', 'response code', 'error code', 'jwt'],
      'troubleshooting': ['error', 'problem', 'fix', 'debug', 'fail'],
      'shopping-cart-plugins': ['woocommerce', 'magento', 'shopify', 'opencart'],
      'payout': ['payout', 'disburse', 'transfer'],
      'batch-services': ['batch', 'bulk', 'reconciliation'],
      'softpos': ['softpos', 'nfc', 'terminal'],
      'snap': ['snap', 'indonesia'],
    };

    for (const [file, kws] of Object.entries(keywords)) {
      if (kws.some(kw => queryLower.includes(kw))) {
        return this.files.get(file) || '';
      }
    }

    return this.files.get('getting-started') || '';
  }
}
