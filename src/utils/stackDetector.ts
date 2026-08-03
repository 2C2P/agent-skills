import * as vscode from 'vscode';

export type TechStack = 'nodejs' | 'dotnet' | 'python' | 'php' | 'java' | null;

export async function detectStack(): Promise<TechStack> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return null;
  }

  const checks: [string, TechStack][] = [
    ['**/package.json', 'nodejs'],
    ['**/*.csproj', 'dotnet'],
    ['**/*.sln', 'dotnet'],
    ['**/requirements.txt', 'python'],
    ['**/pyproject.toml', 'python'],
    ['**/composer.json', 'php'],
    ['**/pom.xml', 'java'],
    ['**/build.gradle', 'java'],
  ];

  for (const [pattern, stack] of checks) {
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
    if (files.length > 0) {
      return stack;
    }
  }

  return null;
}

export function stackToLanguage(stack: TechStack): string {
  switch (stack) {
    case 'nodejs': return 'JavaScript/TypeScript';
    case 'dotnet': return 'C#/.NET';
    case 'python': return 'Python';
    case 'php': return 'PHP';
    case 'java': return 'Java';
    default: return 'JavaScript';
  }
}
