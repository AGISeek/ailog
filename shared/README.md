# @ailog/shared

Shared TypeScript definitions and utilities for the AIlog monorepo.

## Overview

This package provides common TypeScript type definitions, interfaces, and utilities that are shared across all AIlog packages. It ensures type consistency and reduces code duplication throughout the monorepo.

## Key Features

### 🔧 Type Definitions
- **Commit Types**: Core commit data structures
- **Filter Types**: Filtering and search interfaces
- **Statistics Types**: Analytics and metrics definitions
- **VS Code Types**: Extension and webview communication types

### 📦 Centralized Exports
- Single source of truth for all shared types
- Consistent versioning across packages
- Easy to maintain and update

## Architecture

```
src/
├── index.ts              # Main exports
└── types/
    ├── commit.ts         # Commit-related types
    ├── filter.ts         # Filtering and search types
    ├── statistics.ts     # Analytics and metrics types
    └── vscode.ts         # VS Code integration types
```

## Type Definitions

### Commit Types (`types/commit.ts`)

```typescript
export interface Commit {
  commit_time: number;          // Unix timestamp
  commit_hash: string;          // Git commit hash
  repo: string;                 // Repository name
  branch: string;               // Branch name
  committer: string;            // Committer name
  is_ai_generated: boolean;     // AI attribution flag
  code_volume_delta: number;    // Lines added - lines deleted
  notes: string;                // Commit message
}
```

### Filter Types (`types/filter.ts`)

```typescript
export interface CommitFilters {
  dateRange?: [string, string];   // Date range filter
  repository?: string;            // Repository filter
  branch?: string;                // Branch filter
  committer?: string;             // Committer filter
  aiType?: 'all' | 'ai' | 'manual'; // AI type filter
  messageSearch?: string;         // Message search filter
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export interface SorterState {
  field?: string;
  order?: 'ascend' | 'descend';
}
```

### Statistics Types (`types/statistics.ts`)

```typescript
export interface CommitStatistics {
  totalCommits: number;
  aiCommits: number;
  totalLines: number;
  aiLines: number;
  aiCommitRatio: number;        // Percentage
  aiLinesRatio: number;         // Percentage
}

export interface TrendDataPoint {
  date: string;                 // ISO date string
  totalLines: number;
  aiLines: number;
  totalCommits: number;
  aiCommits: number;
}
```

### VS Code Types (`types/vscode.ts`)

```typescript
export interface VSCodeApi {
  postMessage(message: VSCodeOutgoingMessage): void;
  getState(): any;
  setState(state: any): void;
}

export interface VSCodeOutgoingMessage {
  command: string;
  [key: string]: any;
}

export interface VSCodeIncomingMessage {
  command: 'loadCommits' | 'loadRepos' | 'loadBranches' | 'error';
  commits?: Commit[];
  repositories?: string[];
  branches?: string[];
  error?: string;
  [key: string]: any;
}
```

## Usage

### In Extension Package

```typescript
import type { Commit, CommitStatistics } from '@ailog/shared';

// Use types for database operations
const commit: Commit = {
  commit_time: Date.now(),
  commit_hash: 'abc123',
  repo: 'my-repo',
  branch: 'main',
  committer: 'john.doe',
  is_ai_generated: true,
  code_volume_delta: 45,
  notes: 'Add new feature'
};
```

### In Dashboard Package

```typescript
import type { 
  CommitFilters, 
  PaginationState, 
  TrendDataPoint 
} from '@ailog/shared';

// Use types for React component props
interface DashboardProps {
  filters: CommitFilters;
  pagination: PaginationState;
  trendData: TrendDataPoint[];
}
```

## Development

### Build Commands

```bash
# Build TypeScript to JavaScript with declarations
pnpm shared:build

# Watch for changes and rebuild
pnpm shared:dev

# Clean build artifacts
pnpm shared:clean
```

### Package Configuration

The package is configured to generate both CommonJS and ES modules:

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    }
  }
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true
  }
}
```

## Adding New Types

1. **Create Type File**: Add new `.ts` file in `src/types/`
2. **Define Types**: Export interfaces, types, and enums
3. **Update Index**: Add exports to `src/index.ts`
4. **Rebuild**: Run `pnpm shared:build` to generate declarations
5. **Update Consumers**: Import new types in extension/dashboard packages

### Example: Adding Chart Types

```typescript
// src/types/charts.ts
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie';
  data: ChartDataPoint[];
  options?: Record<string, any>;
}

// src/index.ts
export type { ChartDataPoint, ChartConfiguration } from './types/charts';
```

## Dependencies

This package has minimal dependencies to avoid conflicts:

- **TypeScript**: For type definitions and compilation
- **No runtime dependencies**: Pure type definitions only

## Workspace Integration

Other packages reference this package through workspace dependencies:

```json
{
  "dependencies": {
    "@ailog/shared": "workspace:*"
  }
}
```

This ensures:
- Always uses the latest local version
- Type changes are immediately available
- No version conflicts across packages

---

Part of the [AIlog monorepo](../../README.md) - Modern AI-assisted development tracking for VS Code.