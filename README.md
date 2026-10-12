# 2C2P Agent Skills

A central repository of reusable 2C2P resources for AI-assisted development.

Use this repository to give AI assistants relevant 2C2P knowledge, task guidance, shared context, and reusable capabilities across development workflows.

## What this repository provides

This repository helps teams use AI assistants more consistently when working with 2C2P products, services, and development workflows.

- **Skills** — task-focused instructions that help AI assistants perform specific 2C2P-related tasks.
- **Steering** — shared context, standards, and reference guidance that keep AI responses consistent.
- **Powers** — packaged capabilities that combine instructions, tools, and supporting resources.
- **Plugins** — platform-specific integrations and configuration for supported AI development environments.

## Supported platforms

| Platform | Installation method |
| --- | --- |
| **Kiro** | Clone this repository from GitHub and use the local resources in your workspace. |
| **Cursor** | Clone this repository from GitHub and run the Cursor installer. |
| **Qoder** | Install from the Qoder Marketplace or clone this repository from GitHub. |
| **Codex** | Clone this repository from GitHub and use the local resources in your workspace. |

## Install 2C2P AI Tools

### Kiro

Kiro installation is managed from a local Git checkout.

Clone the repository:

```sh
git clone https://github.com/2C2P/agent-skills.git
cd agent-skills
```

Open your development workspace in Kiro and make the relevant 2C2P resources available to the agent.

Use:

- [`skills/`](./skills/) for task-focused skill guidance
- [`steering/`](./steering/) for shared context and standards
- [`powers/`](./powers/) for packaged capabilities

When needed, attach the relevant local folder or file to your Kiro conversation.

### Cursor

Clone the repository and run the Cursor installer from the repository root.

```sh
git clone https://github.com/2C2P/agent-skills.git
cd agent-skills
bash ./install-cursor.sh
```

Reload Cursor if prompted after installation.

### Qoder

Choose either installation method below.

#### Option 1: Install from Qoder Marketplace

1. Open **Marketplace** in Qoder.
2. Search for **2C2P**.
3. Select **Install**.
4. Reload Qoder if prompted.

#### Option 2: Install from GitHub

Clone the repository and run the Qoder installer from the repository root.

```sh
git clone https://github.com/2C2P/agent-skills.git
cd agent-skills
bash ./install-qoder.sh
```

### Codex

Codex installation is managed from a local Git checkout.

Clone the repository:

```sh
git clone https://github.com/2C2P/agent-skills.git
cd agent-skills
```

Open your development workspace in Codex and use the required resources from the local checkout.

Use:

- [`skills/`](./skills/) for task-focused instructions
- [`steering/`](./steering/) for shared context and reference guidance
- [`powers/`](./powers/) for additional packaged capabilities

## How to use the resources

1. Choose and install the resources for your AI development environment.
2. Browse [`skills/`](./skills/) to find available task guidance.
3. Read the [Skills guide](./skills/README.md) for instructions on using the available skills.
4. Add relevant steering content when your AI assistant needs shared context or standards.
5. Explore [`powers/`](./powers/) when you need broader, packaged capabilities.

## Repository structure

| Path | Description |
| --- | --- |
| [`skills/`](./skills/) | Reusable AI agent skills and usage guidance. |
| [`steering/`](./steering/) | Shared instructions, standards, and reference material. |
| [`powers/`](./powers/) | Packaged capabilities and supporting resources. |
| [`plugins/`](./plugins/) | Platform integrations and configuration. |
| [`.cursor-plugin/`](./.cursor-plugin/) | Cursor marketplace and plugin resources. |
| [`.qoder-plugin/`](./.qoder-plugin/) | Qoder marketplace and plugin resources. |

## Get started

After installation:

1. Find the resource that matches your task.
2. Read its documentation before using it.
3. Provide the relevant skill, steering, or power to your AI assistant.
4. Ask the assistant to use the provided guidance for your task.

## Support

For onboarding or questions about using 2C2P AI Tools, contact:

[onboarding@2c2p.com](mailto:onboarding@2c2p.com)

## Contributing

Keep new resources focused, clearly documented, and consistent with the existing repository structure.

Before contributing:

1. Place the resource in the appropriate directory.
2. Add clear usage instructions.
3. Avoid duplicating existing content.
4. Open a pull request for review.
