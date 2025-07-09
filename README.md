# AIlog

**AIlog** is a VS Code extension designed to help you intelligently track and visualize your coding activity, with a special focus on attributing commits generated with the help of AI tools. It records your commit history into a local database and provides a dashboard to analyze your productivity and the impact of AI on your work.

![Dashboard Screenshot](https://user-images.githubusercontent.com/12345/placeholder.png) <!-- TODO: Add a real screenshot -->

## Features

- **📊 Commit Dashboard**: A rich visual interface to explore your commit data.
  - **Key Metrics**: See ratios of AI-generated commits and AI-generated lines of code.
  - **Productivity Trends**: A chart visualizes your code volume (total vs. AI) over time.
  - **Powerful Filtering**: Filter the dashboard view by repository or branch.
- **🤖 AI-Generated Commit Tracking**: A simple click on the status bar icon (`AI Generated: ❌/✅`) lets you flag your next commit as AI-assisted.
- **⚙️ Automatic Data Collection**: Installs a `post-commit` Git hook to automatically and seamlessly capture commit metadata without any manual intervention.
- **🎨 Theme-Aware UI**: The dashboard automatically adapts to your VS Code theme, whether it's light, dark, or high-contrast.
- **🌍 Internationalization**: Supports both **English** and **Chinese (中文)**. The extension's language automatically follows your VS Code settings.
- **📦 Offline Capability**: All dependencies, including charting libraries, are bundled with the extension, ensuring the dashboard works perfectly without an internet connection.

## How It Works

The extension works by installing a `post-commit` hook in your Git repository. After every commit you make, this hook runs a command that passes the commit details to the extension. The extension then saves this information, along with the "AI Generated" status you've set, into a local SQLite database stored in your user home directory.

## Installation

1.  Install the extension from the VS Code Marketplace.
2.  Open a project that is a Git repository.
3.  The first time you open a project, a notification will prompt you to install the Git hook. Click **"Install Hook"**.
    - You can also run the `AIlog: Install Git Hook for AI Attribution` command from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) at any time.

## Usage

1.  **Flagging AI Commits**: Before you make a commit with AI-generated code, click the **`AI Generated: ❌`** text in the status bar. It will change to **`AI Generated: ✅`**. The extension will automatically attribute the next commit as AI-generated and then reset the flag.
2.  **Viewing the Dashboard**: Open the Command Palette and run `AIlog: Show Dashboard`. This will open a new panel showing your commit history and metrics.

## Commands

- `AIlog: Show Dashboard`: Opens the dashboard panel.
- `AIlog: Install Git Hook for AI Attribution`: Installs the Git hook in the current project's repository.
- `AIlog: Toggle AI Generated`: Toggles the AI-generated flag for the next commit (this is the same as clicking the status bar item).

