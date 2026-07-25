# Contributing to the Project

Thank you for your interest in contributing! We welcome contributions from everyone. Please take a moment to review this document before getting started.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
3. [Development Workflow](#development-workflow)
   - [1. Fork & Clone](#1-fork--clone)
   - [2. Create a Branch](#2-create-a-branch)
   - [3. Make Changes & Commit](#3-make-changes--commit)
   - [4. Test Your Changes](#4-test-your-changes)
   - [5. Submit a Pull Request](#5-submit-a-pull-request)
   - [6. Post-Merge Cleanup](#6-post-merge-cleanup)
4. [Commit Message Guidelines](#commit-message-guidelines)
5. [Code Style & Standards](#code-style--standards)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and welcoming environment for all contributors. Please report any unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### Reporting Bugs
Before creating a bug report, please check the existing issues to see if it has already been reported. 

When filing a bug report, please include:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Environment details (OS, version, browser, dependencies, etc.).
- Screenshots or error logs if available.

### Suggesting Enhancements
Feature requests are always welcome! When suggesting an enhancement:
- Check if the feature has already been requested or discussed.
- Clearly explain the use case and why this feature would be useful.
- Provide examples or mockups where applicable.

---

## Development Workflow

We follow the standard **GitHub Flow** branching model. Creating focused branches for specific changes keeps the repository history clean and easy to review.

### 1. Fork & Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/repository-name.git
   cd repository-name
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/repository-name.git
   ```

### 2. Create a Branch
Always create a new branch off `main` for your work. Use descriptive prefix conventions:
- `feature/` for new capabilities (e.g., `feature/user-auth`)
- `bugfix/` or `fix/` for bug fixes (e.g., `bugfix/login-redirect`)
- `docs/` for documentation updates (e.g., `docs/update-readme`)

**Is this standard practice?**  
Yes! Branching off `main` for every task ensures that `main` remains stable and deployment-ready at all times. It isolates your work and makes code reviews significantly easier.

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### 3. Make Changes & Commit
- Make small, atomic commits that address a single logical change.
- Keep commit messages concise and descriptive (see [Commit Message Guidelines](#commit-message-guidelines)).

### 4. Test Your Changes
Before submitting your work, make sure all tests pass and code quality checks are satisfied locally:
```bash
# Example test & lint commands (adjust to your project stack)
npm test        # or pytest, cargo test, etc.
npm run lint    # or flake8, eslint, etc.
```

### 5. Submit a Pull Request (PR)
1. Push your branch to your remote fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Navigate to the main repository on GitHub and click **Compare & pull request**.
3. Fill out the PR template:
   - Reference any related issues (e.g., `Closes #123` or `Fixes #456`).
   - Summarize the changes introduced.
   - Describe test steps or proof of testing.
4. Wait for maintainer review. Be responsive to feedback and make additional commits if requested.

### 6. Post-Merge Cleanup
Once your Pull Request is approved and merged into `main`:
1. Switch back to your local `main` branch and pull the latest changes:
   ```bash
   git checkout main
   git pull upstream main
   ```
2. Delete your local topic branch:
   ```bash
   git branch -d feature/your-feature-name
   ```
3. Delete the remote branch on your GitHub fork:
   ```bash
   git push origin --delete feature/your-feature-name
   ```

*(GitHub also offers an automatic "Delete branch" button on the closed PR page.)*

---

## Commit Message Guidelines

We recommend following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add Google OAuth login`
- `fix: resolve memory leak in background worker`
- `docs: update API setup instructions in CONTRIBUTING.md`
- `refactor: simplify database connection handler`
- `test: add unit tests for user profile service`

---

## Code Style & Standards

- Follow existing formatting and style conventions in the codebase.
- Ensure all linter rules pass before pushing.
- Write clear code comments for complex logic, but prefer self-documenting code.
- Add or update tests for any new features or bug fixes.

---

## Release & Versioning Policy

We follow [Semantic Versioning (SemVer)](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR (`X.0.0`)**: Breaking API or core system changes.
- **MINOR (`0.Y.0`)**: New features or enhancements (backwards-compatible).
- **PATCH (`0.0.Z`)**: Bug fixes and security patches (backwards-compatible).

### Creating a Release Tag

Only project maintainers tag releases. Tags are created on `main` following a merge:

```bash
git checkout main
git pull upstream main
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3