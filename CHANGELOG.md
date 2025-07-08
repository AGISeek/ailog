# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-07

### Added

- **Database Storage**: Automatically records each Git commit's metadata into a local SQLite database. This includes commit hash, time, author, branch, and more.
- **AI Commit Tracking**: A new status bar item allows you to toggle a flag, marking your next commit as AI-generated.
- **Commit Dashboard**: A full-featured webview panel to visualize commit data.
  - **Core Metrics**: Displays ratios for "AI Commits / Total Commits" and "AI Lines / Total Lines".
  - **Trend Chart**: A line chart showing the volume of code (total lines vs. AI-generated lines) over time.
  - **Filtering**: Allows filtering the data by repository and branch.
- **Automated Data Collection**: A Git `post-commit` hook is now used to automatically capture data, ensuring seamless and accurate tracking.
- **Theme (Theming) Support**: The dashboard now automatically adapts to VS Code's light, dark, and high-contrast themes for a native look and feel.
- **Internationalization (i18n)**: Full support for English and Chinese (zh-cn). The UI language automatically follows VS Code's settings.
- **Bundled Dependencies**: The `chart.js` library is now bundled with the extension, removing the need for an internet connection to view the dashboard.
- **Code Comments**: Added comprehensive JSDoc comments to all methods and classes in the TypeScript source files for better maintainability.

### Changed

- **Complete Refactor**: The extension has been significantly refactored from a simple file-watcher to a robust data collection and visualization tool.
- **Version**: Project version updated to 1.0.0 to reflect the major feature additions.

### Removed

- The initial, simplistic AI detection logic based on file watching has been removed in favor of the manual-toggle and Git-hook-based system.
