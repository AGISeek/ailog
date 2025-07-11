# AIlog

**AIlog** is a VS Code extension designed to help you intelligently track and visualize your coding activity, with a special focus on attributing commits generated with the help of AI tools. It features a modern, SOLID architecture with advanced AI detection capabilities and provides a comprehensive dashboard to analyze your productivity and the impact of AI on your work.

![Dashboard Screenshot](https://user-images.githubusercontent.com/12345/placeholder.png) <!-- TODO: Add a real screenshot -->

## Features

### 🤖 **Advanced AI Detection**
- **Multi-dimensional Analysis**: Automatically detects AI-generated code using advanced algorithms
- **Pattern Recognition**: Identifies AI-generated code patterns, syntax completeness, and boilerplate structures
- **Time Proximity Detection**: Correlates code changes with AI command execution timing
- **Manual Override**: Simple status bar toggle for manual AI attribution when needed

### 📊 **Comprehensive Dashboard**
- **Rich Analytics**: Detailed metrics on AI-generated commits and code volume
- **Interactive Charts**: Visual trends showing your productivity over time
- **Advanced Filtering**: Filter by repository, branch, or time period
- **Real-time Updates**: Live data synchronization with your commit history

### 🏗️ **Modern Architecture**
- **SOLID Principles**: Clean, maintainable code following industry best practices
- **Service-Oriented Design**: Modular services for detection, git operations, and UI management
- **Dependency Injection**: Loose coupling between components for better testability
- **Comprehensive Documentation**: Full JSDoc documentation for all classes and methods

### 🌍 **Enhanced User Experience**
- **Internationalization**: Full support for English and Chinese (中文)
- **Theme-Aware UI**: Automatic adaptation to VS Code themes
- **Offline Capability**: All dependencies bundled for offline operation
- **Human-in-the-Loop**: Interactive workflow for commit attribution decisions

### ⚙️ **Seamless Integration**
- **Automatic Git Hooks**: Installs pre-commit and post-commit hooks automatically
- **VS Code Integration**: Deep integration with VS Code's UI and workflow
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Database Storage**: Local SQLite database for fast, reliable data storage

## How It Works

AIlog uses a sophisticated multi-layered approach to detect and track AI-generated code:

1. **Real-time Detection**: Monitors your code changes and applies AI detection algorithms
2. **Git Hook Integration**: Automatically captures commit metadata through Git hooks
3. **Data Analysis**: Processes commit data using multiple analysis dimensions
4. **Dashboard Visualization**: Presents insights through an interactive web-based dashboard

## Installation

1. Install the extension from the VS Code Marketplace
2. Open a Git repository in VS Code
3. The extension will prompt you to install Git hooks - click **"Install Hook"**
4. Start coding and let AIlog track your AI-assisted development!

## Usage

### Basic Workflow
1. **Automatic Detection**: AIlog automatically detects AI-generated code changes
2. **Manual Override**: Click the status bar toggle (`AI Generated: ❌/✅`) to manually mark commits
3. **Interactive Confirmation**: Before commits, choose whether to attribute them to AI
4. **Dashboard Analysis**: View your AI coding patterns in the comprehensive dashboard

### Commands
- `AIlog: Show Dashboard` - Opens the analytics dashboard
- `AIlog: Install Git Hook` - Installs Git hooks for automatic tracking
- `AIlog: Toggle AI Generated` - Manually toggle AI attribution for next commit
- `AIlog: Interactive Commit Check` - Interactive pre-commit AI attribution dialog

## Architecture Overview

AIlog follows SOLID principles with a clean, modular architecture:

```
src/
├── commands/           # Command handlers
├── managers/           # Core coordination logic
├── services/           # Business logic services
│   ├── detection/      # AI detection algorithms
│   ├── git/           # Git operations
│   └── ui/            # User interface services
├── types/             # TypeScript type definitions
├── lib/               # Utility libraries
├── database.ts        # SQLite database operations
├── i18n.ts           # Internationalization
└── extension.ts       # Main extension entry point
```

### Key Components

#### AI Detection System
- **Pattern Analyzer**: Identifies AI-generated code patterns
- **Syntax Analyzer**: Checks for complete, well-formed code structures
- **Comment Analyzer**: Evaluates comment quality and style
- **Boilerplate Analyzer**: Detects common code templates
- **Time Proximity Analyzer**: Correlates timing with AI tool usage

#### Service Layer
- **Git Services**: Handle repository operations and commit processing
- **UI Services**: Manage status bar, notifications, and dashboard
- **Detection Services**: Coordinate AI detection algorithms

#### Management Layer
- **Extension Manager**: Coordinates all services and manages lifecycle
- **Command Manager**: Handles VS Code command registration and execution
- **Document Change Manager**: Monitors and processes file changes

## Configuration

AIlog works out of the box with sensible defaults, but you can customize:

- **Detection Sensitivity**: Adjust AI detection thresholds
- **Language Support**: Enable/disable detection for specific languages
- **Dashboard Preferences**: Customize chart types and data visualization
- **Internationalization**: Switch between English and Chinese interfaces

## Data Storage

- **Local Database**: `~/.watch-cursor/commits.db` (SQLite)
- **Privacy-First**: All data stays on your machine
- **Efficient Storage**: Optimized database schema for fast queries
- **Backup-Friendly**: Standard SQLite format for easy backup/restore

## Development

AIlog is built with modern development practices:

- **TypeScript**: Full type safety and IntelliSense support
- **ESLint**: Code quality enforcement
- **Modular Design**: Easy to extend and maintain
- **Comprehensive Testing**: Manual testing with Extension Development Host
- **Documentation**: Full JSDoc coverage for all APIs

## Contributing

We welcome contributions! Please:

1. Follow the existing code style and architecture
2. Ensure TypeScript compilation passes
3. Run linting before submitting changes
4. Test thoroughly with the Extension Development Host
5. Update documentation and translations as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📖 Documentation: Check the [Development Guide](DEVELOPMENT.md)
- 🐛 Issues: Report bugs on GitHub Issues
- 💬 Discussions: Join our community discussions
- 📧 Contact: Reach out to the maintainers

---

**AIlog** - Intelligent AI-assisted development tracking for VS Code