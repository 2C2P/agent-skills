import * as vscode from 'vscode';

interface IntegrationMethod {
  label: string;
  steeringFile: string;
  description: string;
  icon: string;
}

const METHODS: IntegrationMethod[] = [
  { label: 'QuickPay Link', steeringFile: 'quickpay', description: 'Simplest — one API call', icon: 'link' },
  { label: 'Hosted Payment Page', steeringFile: 'redirect-integration', description: 'Redirect-based checkout', icon: 'browser' },
  { label: 'Direct API', steeringFile: 'direct-integration', description: 'Full UI control', icon: 'code' },
  { label: 'Mobile SDK', steeringFile: 'mobile-sdk', description: 'iOS & Android', icon: 'device-mobile' },
  { label: 'Web SDK', steeringFile: 'web-sdk', description: 'Drop-in web UI', icon: 'globe' },
  { label: 'Shopping Cart Plugins', steeringFile: 'shopping-cart-plugins', description: 'WooCommerce, Magento, Shopify', icon: 'package' },
  { label: 'Refunds & Maintenance', steeringFile: 'payment-maintenance', description: 'Refunds, voids, recurring', icon: 'history' },
  { label: 'Payout', steeringFile: 'payout', description: 'Disburse funds', icon: 'arrow-right' },
  { label: 'Batch Services', steeringFile: 'batch-services', description: 'Bulk operations', icon: 'layers' },
  { label: 'Getting Started', steeringFile: 'getting-started', description: 'Sandbox setup', icon: 'rocket' },
  { label: 'API Reference', steeringFile: 'payment-apis', description: 'Core API docs', icon: 'book' },
  { label: 'Test Cards & Codes', steeringFile: 'references', description: 'Response codes, test data', icon: 'beaker' },
  { label: 'Troubleshooting', steeringFile: 'troubleshooting', description: 'Error diagnosis', icon: 'tools' },
];

class MethodTreeItem extends vscode.TreeItem {
  constructor(public readonly method: IntegrationMethod) {
    super(method.label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = method.description;
    this.description = method.description;
    this.iconPath = new vscode.ThemeIcon(method.icon);
    this.command = {
      command: '2c2p.openDoc',
      title: 'Open Documentation',
      arguments: [method.steeringFile],
    };
  }
}

export class MethodsTreeProvider implements vscode.TreeDataProvider<MethodTreeItem> {
  getTreeItem(element: MethodTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): MethodTreeItem[] {
    return METHODS.map((m) => new MethodTreeItem(m));
  }
}
