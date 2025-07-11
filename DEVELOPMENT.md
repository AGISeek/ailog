# AIlog - Development Guide

## Overview

AIlog is a sophisticated VS Code extension that tracks AI-generated commits and provides advanced analytics through a comprehensive dashboard interface. The extension features a modern SOLID architecture with multi-dimensional AI detection capabilities, helping developers understand their AI-assisted coding patterns and productivity metrics.

## Prerequisites

- **Node.js** (v18 or higher)
- **VS Code** (v1.85.0 or higher)
- **Git repository** for testing
- **TypeScript** knowledge for development

## Development Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/your-org/ailog.git
cd ailog
npm install
```

### 2. Development Commands

#### Build and Compilation
```bash
npm run compile           # Compile TypeScript to JavaScript
npm run watch             # Watch for changes and auto-compile
npm run vscode:prepublish # Prepare for publishing (includes compile)
```

#### Code Quality
```bash
npm run lint              # Run ESLint on src/ directory with TypeScript support
```

#### Packaging
```bash
npm run package           # Create VSIX package using vsce for distribution
```

### 3. Development Workflow

1. **Start Development**: Run `npm run watch` to enable auto-compilation
2. **Launch Extension**: Press `F5` to open Extension Development Host
3. **Test Features**: Use the extension in the development environment
4. **Debug**: Use VS Code's built-in debugger with breakpoints

## Architecture Overview

AIlog follows SOLID principles with a clean, modular architecture designed for maintainability and extensibility.

### Project Structure

```
src/
├── commands/                    # Command handlers (single responsibility)
│   ├── showDashboardCommand.ts     # Dashboard command handler
│   ├── toggleAiCommand.ts          # AI toggle command handler
│   ├── installHookCommand.ts       # Git hook installation command
│   └── processCommitCommand.ts     # Commit processing command
├── managers/                    # Core coordination logic
│   ├── extensionManager.ts         # Main extension coordinator
│   ├── commandManager.ts           # Command registration and management
│   └── documentChangeManager.ts    # Document change event handling
├── services/                    # Business logic services
│   ├── detection/                  # AI detection algorithms
│   │   ├── aiDetectionService.ts      # Main detection coordinator
│   │   ├── patternAnalyzer.ts         # Code pattern analysis
│   │   ├── syntaxAnalyzer.ts          # Syntax completeness analysis
│   │   ├── commentAnalyzer.ts         # Comment quality analysis
│   │   ├── boilerplateAnalyzer.ts     # Boilerplate code detection
│   │   ├── chunkAnalyzer.ts           # Code chunk size analysis
│   │   └── timeProximityAnalyzer.ts   # Time-based correlation analysis
│   ├── git/                        # Git operations
│   │   ├── gitHookService.ts          # Git hook management
│   │   ├── gitCommitService.ts        # Commit data processing
│   │   └── gitAnalysisService.ts      # Git change analysis
│   └── ui/                         # User interface services
│       ├── statusBarService.ts        # Status bar management
│       ├── notificationService.ts     # User notifications
│       └── dashboardService.ts        # Dashboard webview management
├── types/                       # TypeScript type definitions
│   └── index.ts                     # Shared interfaces and types
├── lib/                         # Utility libraries
│   └── commitHookScript.js          # Git hook script
├── database.ts                  # SQLite database operations
├── i18n.ts                      # Internationalization support
├── dashboard.html               # Dashboard UI template
└── extension.ts                 # Main extension entry point
```

## Core Components

### 1. Extension Manager (`src/managers/extensionManager.ts`)
- **Purpose**: Central coordinator for all extension services
- **Responsibilities**: 
  - Service initialization and lifecycle management
  - Dependency injection coordination
  - Extension state management
- **Architecture**: Implements dependency injection pattern

### 2. AI Detection System (`src/services/detection/`)

#### AI Detection Service (`aiDetectionService.ts`)
- **Purpose**: Main coordinator for AI detection algorithms
- **Features**:
  - Multi-dimensional analysis combining multiple detection methods
  - Configurable confidence thresholds
  - Comprehensive result reporting with metadata

#### Detection Analyzers
- **Pattern Analyzer**: Identifies AI-generated code patterns and structures
- **Syntax Analyzer**: Checks for syntactic completeness and well-formed code
- **Comment Analyzer**: Evaluates comment quality and documentation patterns
- **Boilerplate Analyzer**: Detects common code templates and frameworks
- **Chunk Analyzer**: Analyzes code block size and complexity
- **Time Proximity Analyzer**: Correlates code changes with AI tool usage timing

### 3. Git Integration (`src/services/git/`)

#### Git Hook Service (`gitHookService.ts`)
- **Purpose**: Manages Git hook installation and configuration
- **Features**:
  - Automatic pre-commit and post-commit hook installation
  - Cross-platform shell script generation
  - Hook status monitoring and validation

#### Git Commit Service (`gitCommitService.ts`)
- **Purpose**: Processes commit data and metadata
- **Features**:
  - Automatic commit data collection
  - AI attribution flag management
  - Code volume delta calculation

### 4. User Interface (`src/services/ui/`)

#### Dashboard Service (`dashboardService.ts`)
- **Purpose**: Manages dashboard webview and data interaction
- **Features**:
  - Real-time data loading and filtering
  - Chart.js integration for visualizations
  - Internationalization support

#### Status Bar Service (`statusBarService.ts`)
- **Purpose**: Manages VS Code status bar integration
- **Features**:
  - Real-time AI detection status display
  - Manual override toggle functionality
  - Theme-aware UI updates

## Database Schema

The extension uses SQLite for local data storage with the following optimized schema:

```sql
CREATE TABLE commits (
    commit_time INTEGER NOT NULL,           -- Unix timestamp
    commit_hash TEXT PRIMARY KEY,           -- Git commit hash
    repo TEXT NOT NULL,                     -- Repository name
    branch TEXT NOT NULL,                   -- Branch name
    committer TEXT NOT NULL,                -- Committer name
    is_ai_generated INTEGER NOT NULL,       -- AI attribution flag (0/1)
    code_volume_delta INTEGER NOT NULL,     -- Lines added - lines deleted
    code_write_speed_delta INTEGER,         -- Speed metrics (reserved)
    notes TEXT                              -- Commit message
);

-- Indexes for performance
CREATE INDEX idx_commits_time ON commits(commit_time);
CREATE INDEX idx_commits_repo ON commits(repo);
CREATE INDEX idx_commits_branch ON commits(branch);
CREATE INDEX idx_commits_ai ON commits(is_ai_generated);
```

## Key Features Implementation

### 1. AI Detection Pipeline

```typescript
// Multi-dimensional AI detection process
const detectionResult = await aiDetectionService.detectAI(changeEvent);

// Detection includes:
// - Pattern matching (25 points max)
// - Syntax completeness (25 points max)
// - Boilerplate detection (20 points max)
// - Comment quality (15 points max)
// - Time proximity (50 points max)
// - Chunk size analysis (30 points max)

// Confidence threshold: 70/100 for AI classification
```

### 2. Git Hook Integration

The extension installs intelligent Git hooks that:
- **Pre-commit**: Interactive AI attribution confirmation
- **Post-commit**: Automatic data collection and storage
- **Cross-platform**: Shell scripts with VS Code command integration
- **Fallback**: Node.js scripts for environments without VS Code CLI

### 3. Dashboard Analytics

Advanced dashboard features:
- **Real-time Data**: Live updates from SQLite database
- **Interactive Charts**: Chart.js integration with custom themes
- **Advanced Filtering**: Multi-dimensional filtering by repo, branch, time
- **Export Capabilities**: Data export for external analysis

### 4. Internationalization

Complete i18n support:
- **Language Files**: JSON-based translation system
- **Dynamic Switching**: Automatic language detection from VS Code locale
- **Extensible**: Easy to add new languages
- **Template Support**: HTML template placeholder replacement

## Development Patterns

### 1. SOLID Principles Implementation

#### Single Responsibility Principle
- Each service has a single, well-defined purpose
- Command handlers are separated by functionality
- Analyzers focus on specific detection aspects

#### Open/Closed Principle
- Detection system is open for extension (new analyzers)
- Closed for modification (stable interfaces)
- Service interfaces allow new implementations

#### Liskov Substitution Principle
- Services implement consistent interfaces
- Analyzers follow common patterns
- Dependency injection enables substitution

#### Interface Segregation Principle
- Focused interfaces for specific responsibilities
- No forced dependencies on unused methods
- Clean API boundaries

#### Dependency Inversion Principle
- High-level modules depend on abstractions
- Dependency injection throughout the system
- Loose coupling between components

### 2. Error Handling

Comprehensive error handling strategy:
- **Graceful Degradation**: Extension continues working with reduced functionality
- **User Feedback**: Clear error messages and recovery suggestions
- **Logging**: Detailed console logging for debugging
- **Validation**: Input validation at service boundaries

### 3. Testing Strategy

While no automated tests are currently implemented, the extension supports:
- **Manual Testing**: Extension Development Host environment
- **Integration Testing**: Real Git repository testing
- **Performance Testing**: Large codebase validation
- **Cross-platform Testing**: Windows, macOS, Linux compatibility

## Configuration and Customization

### Detection Configuration

```typescript
interface DetectionConfig {
    confidenceThreshold: number;      // AI detection threshold (0-100)
    chunkSizeThreshold: number;       // Minimum code chunk size for analysis
    timeProximityWindow: number;      // Time window for proximity analysis (ms)
    enableTimeProximity: boolean;     // Enable/disable time-based detection
    enablePatternMatching: boolean;   // Enable/disable pattern matching
}
```

### Extension Settings

The extension supports various configuration options:
- **Detection Sensitivity**: Adjustable AI detection thresholds
- **Language Support**: Enable/disable detection for specific languages
- **Dashboard Preferences**: Chart types and visualization options
- **Database Location**: Custom database path configuration

## Performance Considerations

### 1. Database Optimization
- **Indexed Queries**: Strategic indexes for common query patterns
- **Batch Operations**: Bulk inserts for better performance
- **Connection Pooling**: Efficient database connection management

### 2. Memory Management
- **Lazy Loading**: Services initialized only when needed
- **Event Cleanup**: Proper disposal of event listeners
- **Webview Management**: Efficient webview lifecycle management

### 3. Detection Efficiency
- **Early Termination**: Skip analysis for small changes
- **Caching**: Cache detection results for repeated analysis
- **Incremental Analysis**: Only analyze changed portions

## Extending the Extension

### Adding New Detection Analyzers

1. **Create Analyzer Class**:
```typescript
export class NewAnalyzer {
    public analyze(text: string): { score: number; reasons: string[] } {
        // Implementation
    }
}
```

2. **Register in Detection Service**:
```typescript
// Add to aiDetectionService.ts
private readonly newAnalyzer = new NewAnalyzer();
```

3. **Update Detection Logic**:
```typescript
// Include in detection pipeline
const newScore = this.newAnalyzer.analyze(text);
```

### Adding New Commands

1. **Create Command Handler**:
```typescript
export class NewCommand {
    public async execute(): Promise<void> {
        // Implementation
    }
}
```

2. **Register in Command Manager**:
```typescript
// Add to commandManager.ts
this.registerCommand('ailog.newCommand', () => new NewCommand().execute());
```

## Troubleshooting

### Common Development Issues

1. **TypeScript Compilation Errors**
   - Ensure all imports are correctly typed
   - Check for missing type definitions
   - Run `npm run compile` to see detailed errors

2. **Extension Not Loading**
   - Verify `package.json` activation events
   - Check extension manifest configuration
   - Review Extension Development Host console

3. **Database Connection Issues**
   - Ensure SQLite3 is properly installed
   - Check database file permissions
   - Verify database schema initialization

4. **Git Hook Installation Failures**
   - Confirm VS Code has file system permissions
   - Verify Git repository is properly initialized
   - Check Git hooks directory permissions

### Debug Configuration

Enable comprehensive debugging:

1. **VS Code Debug Console**:
```
Help > Toggle Developer Tools > Console
```

2. **Extension Debug Mode**:
```typescript
// Add to extension.ts
console.log('[AIlog] Debug information:', data);
```

3. **Database Debug Queries**:
```typescript
// Add to database.ts
console.log('[AIlog] Query:', query, params);
```

## Future Enhancements

### Planned Features
- **Automated Testing**: Jest/Mocha test framework integration
- **Cloud Sync**: Optional cloud synchronization for team insights
- **Advanced Analytics**: Machine learning-based detection improvements
- **Plugin System**: Extensible architecture for third-party analyzers
- **Performance Metrics**: Detailed performance tracking and optimization

### Architecture Improvements
- **Microservices**: Further decomposition of services
- **Event-Driven**: Transition to event-driven architecture
- **Caching Layer**: Redis-like caching for improved performance
- **API Layer**: RESTful API for external integrations

## Contributing

We welcome contributions to AIlog! Please follow these guidelines:

### Code Style
- Follow existing TypeScript patterns and conventions
- Use meaningful variable and function names
- Add comprehensive JSDoc comments for all public APIs
- Maintain consistent indentation and formatting

### Development Process
1. **Fork the Repository**: Create your own fork for development
2. **Create Feature Branch**: Use descriptive branch names
3. **Follow SOLID Principles**: Ensure new code follows architectural patterns
4. **Test Thoroughly**: Test with Extension Development Host
5. **Update Documentation**: Update relevant documentation
6. **Submit Pull Request**: Provide clear description of changes

### Code Review Criteria
- **Functionality**: Does the code work as intended?
- **Architecture**: Does it follow SOLID principles?
- **Documentation**: Is the code well-documented?
- **Performance**: Are there any performance implications?
- **Testing**: Has the code been thoroughly tested?

---

This development guide provides a comprehensive overview of the AIlog extension architecture and development practices. For specific implementation details, refer to the source code and inline documentation.