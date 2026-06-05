# Contributing to CensusGrid

We welcome contributions to CensusGrid! Whether you are fixing bugs, optimizing query performance, improving the developer portal UI, or correcting administrative village data, your help is highly appreciated.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, welcoming, and professional environment for all contributors.

---

## How to Contribute

### 1. Report Bugs & Request Features
If you find a bug or have a feature request, please open a GitHub Issue. Provide:
* A clear, descriptive title.
* Steps to reproduce the issue.
* Expected vs. actual behavior.
* Environment details (Node.js version, browser, database, etc.).

### 2. Code Contributions
To submit code changes:
1. **Fork the Repository**: Create a personal copy of the repository on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Set Up Local Environment**: Follow the setup instructions in the [README.md](README.md) to initialize the database and caching layer.
4. **Make and Test Your Changes**: Ensure your code is clean, well-commented, and does not break existing database schemas or API contracts.
5. **Commit Your Changes**: Use clear, concise commit messages.
   ```bash
   git commit -m "Brief description of changes"
   ```
6. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**: Target the `main` branch of the parent repository. Describe your changes, the rationale behind them, and how you verified them.

---

## Engineering Guidelines

### Backend (Express & Prisma)
* Keep middleware focused and modular (e.g., separate rate limiting from authentication).
* Perform strict schema validation using Zod for incoming payloads.
* Keep queries optimal; verify that new database lookups do not cause N+1 query problems. Use Prisma `include` or `select` judiciously.
* Always check for Redis cache resolution before falling back to the database.

### Frontend (React & Vite)
* Write functional components with clean React hooks.
* Maintain the cohesive dark/glassmorphic design language.
* Avoid bloated external packages. Use standard tailwind styles or custom vanilla CSS.
* Ensure all interactive elements have responsive layouts.
