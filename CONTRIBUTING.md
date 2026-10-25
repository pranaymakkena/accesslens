# Contributing to AccessLens

Thank you for your interest in contributing to AccessLens! We welcome contributions in the form of bug reports, feature requests, code improvements, and documentation updates.

## Code of Conduct

Be respectful and inclusive. We are committed to providing a welcoming and harassment-free environment for all contributors.

## How to Contribute

### Reporting Issues

Before reporting an issue, check if it has already been reported. When reporting a new issue:

1. Use a clear, descriptive title.
2. Describe the problem in detail.
3. Provide steps to reproduce.
4. Include your environment (OS, browser, Node.js version, etc.).
5. Attach screenshots if relevant.

### Feature Requests

Describe the feature, why it would be useful, and how you envision it working. 

### Code Contributions

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and write tests if applicable.
4. Commit with clear messages: `git commit -m "Add feature: description"`
5. Push to your fork and create a Pull Request.

### Code Standards

- Follow the existing code style.
- Use TypeScript for Angular code, Java for backend, JavaScript for Node services.
- Include JSDoc or similar comments for complex logic.
- Write tests for critical functionality.

### Testing

Before submitting a PR:

- Run the test suite: `npm test` (frontend/scanner) or `mvn test` (backend).
- Verify the build succeeds: `ng build` (frontend), `mvn clean install` (backend).
- Test manually if applicable.

## Development Setup

See the main README.md for setup instructions.

## Pull Request Process

1. Update the CHANGELOG.md with your changes.
2. Ensure all tests pass.
3. Add a description of your changes.
4. Link any related issues.
5. Wait for review feedback.

## Security

If you discover a security vulnerability, please see SECURITY.md for reporting instructions. Do not open a public issue.

Thank you for making AccessLens better!
