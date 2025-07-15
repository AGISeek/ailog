# @ailog/dashboard

React-based dashboard for AIlog - provides modern analytics and visualization for AI-assisted development tracking.

## Overview

This package contains a modern React application built with Ant Design that provides comprehensive analytics and visualization for your AI-assisted coding activity. The dashboard is embedded within the VS Code extension as a webview.

## Key Features

### 🎨 Modern UI
- **React 19**: Latest React with improved performance
- **Ant Design 5.26**: Modern component library with dark theme support
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Full type safety with shared type definitions

### 📊 Analytics & Visualization
- **Statistics Cards**: Key metrics display (total commits, AI commits, code lines)
- **Interactive Charts**: Trend visualization using Chart.js integration
- **Real-time Data**: Live updates from VS Code extension
- **Responsive Design**: Adapts to different screen sizes

### 🌍 User Experience
- **Dark Theme**: Automatic VS Code theme integration
- **Internationalization**: Complete English and Chinese support
- **Smart Filtering**: Date range and message search
- **Compact Mode**: Optimized for VS Code webview

## Architecture

```
src/
├── App.tsx                 # Main React application
├── components/             # React components
│   ├── StatisticsCards/    # Metrics display components
│   ├── FilterControls/     # Filtering interface
│   └── CommitsTable/       # Data table with pagination
├── hooks/                  # Custom React hooks
│   ├── useCommits.ts       # Data fetching and management
│   ├── useVSCodeApi.ts     # VS Code API integration
│   └── index.ts            # Hook exports
├── stores/                 # Zustand state management
│   ├── commitStore.ts      # Commit data state
│   ├── filterStore.ts      # Filter and pagination state
│   └── index.ts            # Store exports
├── styles/                 # Global styles and themes
│   └── global.css          # VS Code theme integration
├── types/                  # TypeScript definitions
│   └── index.ts            # Local type definitions
├── locales/                # Internationalization
│   ├── en.json             # English translations
│   ├── zh.json             # Chinese translations
│   └── index.ts            # i18n configuration
└── main.tsx                # React app entry point
```

## Technology Stack

### Core
- **React 19.1.0**: Modern React with latest features
- **TypeScript**: Full type safety
- **Vite 7.0.4**: Fast build tool and dev server

### UI & Styling
- **Ant Design 5.26.4**: Component library with dark theme
- **@ant-design/charts 2.6.0**: Chart components
- **@ant-design/icons 5.6.1**: Icon library

### State Management
- **Zustand 5.0.2**: Lightweight state management
- **@tanstack/react-query**: Data fetching and caching

### Internationalization
- **i18next 24.0.5**: Internationalization framework
- **react-i18next 15.1.1**: React integration

### Utilities
- **dayjs 1.11.13**: Date manipulation
- **@ailog/shared**: Shared TypeScript definitions

## Development

### Build Commands
```bash
# Development server with hot reload
pnpm dashboard:dev

# Build for production (outputs to extension)
pnpm dashboard:build

# Preview production build
pnpm dashboard:preview

# Lint code
pnpm dashboard:lint
```

### Development Workflow

1. **Start Development**:
   ```bash
   pnpm dashboard:dev
   ```
   Opens development server at `http://localhost:5173`

2. **Hot Reload**: Changes are automatically reflected in the browser

3. **Build for Extension**:
   ```bash
   pnpm dashboard:build
   ```
   Outputs to `../extension/src/dashboard-dist/`

4. **Test in Extension**: Package the extension and test the dashboard within VS Code

### VS Code Integration

The dashboard communicates with the VS Code extension through the webview API:

```typescript
// Receiving data from extension
window.addEventListener('message', (event) => {
  const message = event.data;
  // Process message based on command
});

// Sending messages to extension
vscode.postMessage({
  command: 'getCommits',
  // additional parameters
});
```

## Theme Integration

The dashboard automatically adapts to VS Code themes using CSS custom properties:

```css
:root {
  /* VS Code theme variables */
  --vscode-editor-background: #1e1e1e;
  --vscode-foreground: #cccccc;
  --vscode-icon-foreground: #c5c5c5;
  /* ... more variables */
}
```

### Ant Design Theme Configuration

```typescript
<ConfigProvider
  locale={i18n.language.startsWith('zh') ? zhCN : enUS}
  componentSize="small"
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      colorBgContainer: 'var(--vscode-editor-widget-background)',
      colorIcon: 'var(--vscode-icon-foreground)',
      // ... more theme tokens
    },
  }}
>
```

## Data Flow

1. **Extension Loads Data**: Fetches commits from SQLite database
2. **Message Passing**: Sends data to dashboard via webview API
3. **State Management**: Zustand stores manage data and UI state
4. **Filtering**: Client-side filtering and pagination
5. **Visualization**: Ant Design components render the UI

## Internationalization

The dashboard supports multiple languages with react-i18next:

### Adding Translations
1. Add keys to `src/locales/en.json` and `src/locales/zh.json`
2. Use in components: `const { t } = useTranslation();`
3. Template interpolation: `t('key', { variable: value })`

### Language Detection
Automatically detects language from VS Code settings and falls back to browser language.

## Build Output

The build process outputs static files to the extension package:

```
../extension/src/dashboard-dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── antd-[hash].js      # Ant Design bundle
│   ├── vendor-[hash].js    # Third-party dependencies
│   └── index-[hash].css    # Compiled CSS
└── worker-[hash].js        # Web worker (if any)
```

---

Part of the [AIlog monorepo](../../README.md) - Modern AI-assisted development tracking for VS Code.