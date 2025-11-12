# 🔍 Local Knowledge Search

> **Privacy-first intelligent document search powered by client-side AI**

A sophisticated Progressive Web Application (PWA) that enables users to upload, process, and search through their documents using advanced AI embeddings—all running entirely in the browser for maximum privacy and security.

[![Tests](https://img.shields.io/badge/tests-34%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Privacy First](https://img.shields.io/badge/privacy-first-purple)]()
[![AI Powered](https://img.shields.io/badge/AI-Transformers.js-orange)]()

## ✨ Key Features

### 🔒 **Complete Privacy**
- **100% client-side processing** - your documents never leave your device
- No server uploads, no cloud storage, no tracking
- Data stored locally in browser using IndexedDB

### 🧠 **Advanced AI Search**
- **Semantic search** using Transformers.js with `all-MiniLM-L6-v2` embeddings
- Context-aware results with relevance scoring and snippets
- Intelligent text chunking with configurable overlap

### 📄 **Multi-Format Support**
- **PDF, DOCX, Markdown, and plain text** files
- Robust text extraction with error handling
- Automatic file type detection

### ⚡ **Performance Optimized**
- **Web Workers** for non-blocking AI processing
- **LanceDB** vector storage for lightning-fast similarity search
- Progressive loading with real-time progress tracking
- Responsive design with Tailwind CSS v4

### 🎯 **Professional UI/UX**
- Clean, modern interface with intuitive navigation
- Drag-and-drop file uploads with visual feedback
- Beautiful search results with highlighting and context
- Accessibility-first design (WCAG 2.1 AA compliant)

## 🛠 Technology Stack

### Frontend
- **React 18.3** with TypeScript 5.3 (strict mode)
- **Vite 5.1** for lightning-fast development
- **Tailwind CSS v4** with modern design system
- **Zustand** for efficient state management

### AI & Search
- **Transformers.js** (`all-MiniLM-L6-v2`) for client-side embeddings
- **LanceDB** for high-performance vector storage
- **Custom semantic chunking** with overlap optimization
- **Cosine similarity** search with relevance scoring

### Testing & Quality
- **Vitest** with comprehensive test suite (34 tests, 100% pass rate)
- **TypeScript strict mode** with zero compilation errors
- **ESLint + Prettier** for code quality
- **≥85% test coverage** on critical paths

## 📁 Project Architecture

```
src/
├── components/          # Modular React components
│   ├── AppHeader.tsx    # Navigation and branding
│   ├── DocumentUpload.tsx # File upload interface
│   ├── SearchInterface.tsx # Search input and filters
│   ├── SearchResults.tsx   # Results display with highlighting
│   └── ProcessingProgress.tsx # Real-time processing status
├── lib/                 # Core business logic
│   ├── embeddingService.ts    # AI embedding generation
│   ├── vectorStorageService.ts # LanceDB vector operations
│   ├── textExtractor.ts       # Multi-format text extraction
│   ├── textChunker.ts         # Intelligent text segmentation
│   └── knowledgeSearchService.ts # Main search orchestration
├── workers/             # Background processing
│   └── embeddingWorker.ts     # Web Worker for AI computations
└── __tests__/           # Comprehensive test suite
    ├── mockServices.test.ts   # Core functionality tests
    ├── textChunker.test.ts    # Text processing tests
    └── embeddingService.test.ts # AI integration tests
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ (project uses 22.8.0)
- Modern browser with WebAssembly support

### Installation
```bash
# Clone the repository
git clone https://github.com/Poolchaos/local-knowledge-search.git
cd local-knowledge-search

# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing
```bash
# Run comprehensive test suite
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Build for Production
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 🔧 Configuration

### Embedding Model
The project uses `all-MiniLM-L6-v2` by default. To use a different model:

```typescript
// src/lib/embeddingService.ts
const MODEL_NAME = 'Xenova/your-preferred-model';
```

### Text Chunking
Configure chunking parameters in `textChunker.ts`:

```typescript
const DEFAULT_CONFIG = {
  maxWordsPerChunk: 500,    // Maximum words per chunk
  overlapWords: 50,         // Overlap between chunks
  minChunkWords: 50         // Minimum viable chunk size
};
```

### Vector Storage
LanceDB configuration in `vectorStorageService.ts`:

```typescript
const VECTOR_DIMENSIONS = 384;  // Match your embedding model
const TABLE_NAME = 'document_embeddings';
```

## 🎯 Use Cases

### 📚 **Research & Academia**
- Search through research papers and academic documents
- Find relevant passages across multiple sources
- Organize and query personal knowledge base

### 💼 **Professional Documentation**
- Navigate large technical documentation sets
- Search meeting notes and project documents
- Find relevant information across contracts and reports

### 📝 **Personal Knowledge Management**
- Search through journal entries and notes
- Find information across diverse document types
- Build your personal search engine

### 🏢 **Team Collaboration**
- Share knowledge bases without privacy concerns
- Search through team documents locally
- Maintain document confidentiality

## 🔒 Privacy & Security

### Data Protection
- **No data transmission**: All processing happens in your browser
- **Local storage only**: Documents stored in IndexedDB
- **No tracking**: Zero analytics or telemetry
- **No accounts**: No registration or authentication required

### Security Features
- Content Security Policy (CSP) headers
- Secure handling of file uploads
- Input validation and sanitization
- Error boundaries for graceful failures

## 📊 Performance Metrics

### Search Performance
- **Sub-second search** for typical document collections
- **Optimized embeddings** with 384-dimension vectors
- **Efficient chunking** with smart overlap handling
- **Progressive loading** for large documents

### Resource Usage
- **Moderate memory footprint** (~100-300MB for typical use)
- **Efficient CPU usage** with Web Worker isolation
- **Optimized bundle size** with code splitting
- **Battery-friendly** background processing

## 🧪 Testing Strategy

### Comprehensive Coverage
- **34 tests** across 5 test files
- **Unit tests** for core algorithms
- **Integration tests** for user workflows
- **Mock services** for reliable, fast testing

### Quality Gates
- TypeScript strict mode with zero errors
- ESLint with no warnings on new code
- All tests must pass before commits
- Performance benchmarks for search operations

## 🛣 Roadmap

### Phase 1: Foundation ✅
- [x] Core document processing and search
- [x] Multi-format file support
- [x] Comprehensive test suite
- [x] Professional UI/UX

### Phase 2: Enhanced Features
- [ ] Advanced search filters (date, file type, size)
- [ ] Document similarity recommendations
- [ ] Export search results and summaries
- [ ] Custom embedding model selection

### Phase 3: Advanced Capabilities
- [ ] OCR support for scanned documents
- [ ] Audio transcription and search
- [ ] Collaborative sharing (still privacy-first)
- [ ] Browser extension for web page search

### Phase 4: Ecosystem
- [ ] Plugin architecture for custom processors
- [ ] Integration with popular note-taking apps
- [ ] Mobile-optimized PWA features
- [ ] Offline-first synchronization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Implement changes with tests
4. Ensure all tests pass (`npm run test`)
5. Commit using semantic format (`feat: add amazing feature`)
6. Push and create Pull Request

### Code Standards
- TypeScript strict mode required
- Comprehensive tests for new features
- ESLint and Prettier compliance
- Semantic commit messages
- Documentation updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for the incredible Transformers.js library
- **LanceDB** team for high-performance vector storage
- **React** and **Vite** communities for amazing developer tools
- **Tailwind CSS** for the beautiful design system

---

**Built with ❤️ for privacy-conscious knowledge workers**

*Experience the future of document search—private, powerful, and completely under your control.*