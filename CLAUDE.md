# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Compilation
- `npm run compile` - Compiles TypeScript to JavaScript in the `out/` directory
- `npm run watch` - Watches TypeScript files and compiles on changes
- `npm run vscode:prepublish` - Prepares extension for publishing (runs compile)

### Linting and Code Quality
- `npm run lint` - Runs ESLint on the `src/` directory with TypeScript support

### Packaging
- `npm run package` - Creates a VSIX package using vsce for distribution

### Testing
No test framework is currently configured. The project uses manual testing through VS Code extension development.

## Architecture Overview

### Extension Structure
This is a VS Code extension that tracks AI-generated commits and provides analytics through a dashboard interface. The main components are:

**Core Files:**
- `src/extension.ts` - Main extension entry point with command registration and Git hook management
- `src/database.ts` - SQLite database operations for commit tracking
- `src/i18n.ts` - Internationalization support (English/Chinese)
- `src/dashboard.html` - Dashboard UI with Chart.js integration

**Key Dependencies:**
- `simple-git` - Git operations and commit analysis
- `sqlite3` - Local database for commit storage
- `chart.js` - Dashboard data visualization

### Database Schema
The extension uses SQLite with a single `commits` table stored in `~/.watch-cursor/commits.db`:
- `commit_time`, `commit_hash`, `repo`, `branch`, `committer`
- `is_ai_generated` (boolean) - Core functionality for AI attribution
- `code_volume_delta` - Lines added minus lines deleted
- `notes` - Commit message

### Git Hook Integration
The extension installs a `post-commit` hook that executes `code --command ailog.processCommit` to automatically capture commit metadata after each commit.

### Commands and UI
- Status bar toggle for marking next commit as AI-generated
- Dashboard webview panel with filtering by repo/branch
- Automatic Git hook installation with user prompts

### Internationalization
Supports English and Chinese through JSON files in `l10n/` directory, with dynamic language switching based on VS Code locale.

## Development Notes

### TypeScript Configuration
- Target: ES2020 with CommonJS modules
- Strict type checking enabled
- Source maps for debugging
- Output directory: `out/`

### VS Code Extension Specifics
- Activation: `onStartupFinished` 
- Main entry: `./out/extension.js`
- Webview security: Local resource access restricted to `src/`, `node_modules/`, and `l10n/` directories
- Status bar integration with command binding

### File Structure
- `src/` - TypeScript source files
- `out/` - Compiled JavaScript (build output)
- `l10n/` - Localization JSON files
- `node_modules/` - Dependencies (Chart.js bundled for offline use)