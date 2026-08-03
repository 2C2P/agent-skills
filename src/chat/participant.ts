import * as vscode from 'vscode';
import { KnowledgeBase } from '../utils/knowledgeBase';
import { detectStack, stackToLanguage } from '../utils/stackDetector';

const BASE_PROMPT = `You are 2C2P Payments integration assistant.
Guide developers through integrating 2C2P Payment Gateway — from sandbox setup to production.
You cover: Hosted Payment Page, Direct API, Web SDK, Mobile SDK, QuickPay links.

Rules:
- Detect the user's tech stack and provide code in that language
- Never hardcode secrets — always use environment variables
- Use placeholder format <YOUR_MERCHANT_ID> / <YOUR_SECRET_KEY>
- If user is unsure which method, recommend QuickPay Link first
- Provide sandbox test cards when asked about testing
- Sandbox base URL: https://sandbox-pgw.2c2p.com
- Sandbox Merchant ID: JT01`;

export function registerChatParticipant(
  context: vscode.ExtensionContext,
  knowledgeBase: KnowledgeBase
) {
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    let prompt = BASE_PROMPT;
    let relevantDocs = '';

    // Route based on command
    if (request.command === 'quickpay') {
      relevantDocs = knowledgeBase.getFile('quickpay');
      prompt += '\n\nFocus on QuickPay Link integration.';
    } else if (request.command === 'redirect') {
      relevantDocs = knowledgeBase.getFile('redirect-integration');
      prompt += '\n\nFocus on Hosted Payment Page / Redirect integration.';
    } else if (request.command === 'direct') {
      relevantDocs = knowledgeBase.getFile('direct-integration');
      prompt += '\n\nFocus on Direct API integration.';
    } else if (request.command === 'test') {
      relevantDocs = knowledgeBase.getFile('references');
      prompt += '\n\nProvide testing guidance with sandbox test cards.';
    } else {
      relevantDocs = knowledgeBase.search(request.prompt);
    }

    // Detect tech stack
    const stack = await detectStack();
    if (stack) {
      prompt += `\n\nThe user's detected tech stack is: ${stackToLanguage(stack)}. Provide code examples in this language.`;
    }

    // Build messages
    const messages: vscode.LanguageModelChatMessage[] = [
      vscode.LanguageModelChatMessage.User(prompt),
    ];

    // Add relevant docs as context
    if (relevantDocs) {
      const truncated = relevantDocs.substring(0, 8000);
      messages.push(
        vscode.LanguageModelChatMessage.User(
          `Reference documentation:\n${truncated}`
        )
      );
    }

    // Add message history
    const previousMessages = chatContext.history.filter(
      (h) => h instanceof vscode.ChatResponseTurn
    );
    previousMessages.forEach((m) => {
      let fullMessage = '';
      m.response.forEach((r) => {
        const mdPart = r as vscode.ChatResponseMarkdownPart;
        fullMessage += mdPart.value.value;
      });
      messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
    });

    // Add user message
    messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

    // Send request and stream response
    try {
      const chatResponse = await request.model.sendRequest(messages, {}, token);
      for await (const fragment of chatResponse.text) {
        stream.markdown(fragment);
      }
    } catch (err) {
      stream.markdown('⚠️ Error processing your request. Please try again.');
      console.error('[2C2P Chat]', err);
    }
  };

  // Register participant
  const participant = vscode.chat.createChatParticipant(
    '2c2p-payments.2c2p',
    handler
  );
  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    'assets',
    'logo-square.png'
  );

  context.subscriptions.push(participant);
}
