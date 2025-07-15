# @ailog/extension

VS Code Extension package for AIlog - the core extension that provides AI-assisted development tracking.

## Overview

This package contains the main VS Code extension logic, including:

- **Git Integration**: Automatic Git hook installation and commit processing
- **AI Detection**: Advanced multi-dimensional AI code detection algorithms
- **Database Operations**: SQLite database for local commit storage
- **VS Code Integration**: Status bar, commands, and webview management
- **Dashboard Hosting**: Serves the React dashboard within VS Code

## Key Features

### 🤖 AI Detection System
- Multi-dimensional analysis combining pattern recognition, syntax analysis, and time correlation
- Configurable confidence thresholds
- Real-time detection with status bar indicators

### 📊 Data Management
- Local SQLite database for privacy-first storage
- Automatic commit metadata capture via Git hooks
- Optimized queries with proper indexing

### 🎨 VS Code Integration
- Native status bar integration
- Command palette commands
- Webview dashboard with theme support
- Automatic Git hook installation

## Architecture

```
src/
├── database.ts           # SQLite operations and schema
├── extension.ts          # Main extension entry point
└── dashboard-dist/       # Built React dashboard (generated)
```

## Development

### Prerequisites
- VS Code Extension Development Host
- Git repository for testing
- SQLite3 dependencies

### Build Commands
```bash
# Build the extension
pnpm extension:build

# Package for distribution
pnpm extension:package

# Development with auto-compilation
pnpm extension:dev
```

### Testing
1. Press `F5` to launch Extension Development Host
2. Open a Git repository in the new VS Code window
3. Test extension features and commands

## Database Schema

The extension uses SQLite with the following optimized schema:

```sql
CREATE TABLE commits (
    commit_time INTEGER NOT NULL,           -- Unix timestamp
    commit_hash TEXT PRIMARY KEY,           -- Git commit hash
    repo TEXT NOT NULL,                     -- Repository name
    branch TEXT NOT NULL,                   -- Branch name
    committer TEXT NOT NULL,                -- Committer name
    is_ai_generated INTEGER NOT NULL,       -- AI attribution flag (0/1)
    code_volume_delta INTEGER NOT NULL,     -- Lines added - lines deleted
    notes TEXT                              -- Commit message
);

-- Performance indexes
CREATE INDEX idx_commits_time ON commits(commit_time);
CREATE INDEX idx_commits_repo ON commits(repo);
CREATE INDEX idx_commits_branch ON commits(branch);
CREATE INDEX idx_commits_ai ON commits(is_ai_generated);
```

## Commands

- `ailog.showDashboard` - Opens the analytics dashboard
- `ailog.installGitHook` - Installs Git hooks for automatic tracking  
- `ailog.toggleAiGenerated` - Manually toggle AI attribution
- `ailog.interactiveCommitCheck` - Interactive pre-commit dialog
- `ailog.processCommit` - Process commit metadata (called by Git hooks)

## Configuration

The extension works with sensible defaults but supports configuration through VS Code settings.

## Dependencies

- **simple-git**: Git operations and repository analysis
- **sqlite3**: Local database operations
- **@ailog/shared**: Shared TypeScript definitions

## File Storage

- **Database**: `~/.watch-cursor/commits.db`
- **Git Hooks**: `.git/hooks/pre-commit` and `.git/hooks/post-commit`

---

Part of the [AIlog monorepo](../../README.md) - Modern AI-assisted development tracking for VS Code.