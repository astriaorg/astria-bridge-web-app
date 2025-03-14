# Astria Bridge Web App Development Guide

## Build & Run Commands
```bash
# Development
just web run              # Start development server
npm start                 # Alternative way to start dev server

# Testing
just test                 # Run all tests
just test web             # Run web tests only
npm test -- path/to/test.test.tsx   # Run specific test file
npm test -- -t "test name"          # Run specific test

# Linting & Formatting
just lint                 # Lint all code
just fmt                  # Format all code
just lint-ts-apply        # Apply safe lint fixes
npm run check             # Check code with Biome
npm run format            # Format code with Biome
```

## Code Style Guidelines
- **File Structure**: Components in `components/`, features in `features/`, pages in `pages/`
- **Naming**: PascalCase for components/contexts, camelCase for hooks (use* prefix), utils
- **Formatting**: 2 spaces, 80 char line width, organized imports (Biome enforced). Files should end with an empty newline.
- **Components**: Co-locate tests with implementation (.test.tsx next to component)
- **TypeScript**: Strict mode enabled, prefer explicit types
- **Error Handling**: Use NotificationsContext/useNotifications for displaying errors
- **Testing**: Use React Testing Library, Jest, test helpers in testHelpers.tsx
- **Styling**: Bulma CSS with SCSS customizations in styles/ directory
