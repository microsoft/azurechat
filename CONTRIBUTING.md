# Contributing to QChat Solution

First off, thanks for taking the time to contribute!

<!-- ## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [project email]. -->

## How Can I Contribute?

### Reporting Issues

Before creating issues, please check [this list](#before-submitting-an-issue) to see if the issue has already been addressed. When creating an issue, please [include as many details as possible](#how-do-i-submit-a-good-issue) to help us understand and resolve the issue quickly.

If you're not confident in using GitHub, you can log standard issues and request QChat Dev Credentials at [QChat Support](https://qchat.ai.qld.gov/support).

### Pull Requests

To have your contribution considered by the maintainers, please follow these steps:

1. **Fork and Clone the Repository:**

   ```bash
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>/qchat.git
   # Navigate to the newly cloned directory
   cd qchat
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/QDAP-DATAAI/qchat.git
   ```

2. **Update Your Fork:**
   If you cloned a while ago, get the latest changes from upstream:

   ```bash
   git checkout <dev-branch>
   git pull upstream <dev-branch>
   ```

3. **Create a New Branch:**
   Create a new topic branch (off the main project development branch) to contain your feature, change, or fix:

   ```bash
   git checkout -b <topic-branch-name>
   ```

4. **Make Commits:**
   Commit your changes in logical chunks. Please adhere to the git commit message guidelines to ensure your code is likely to be merged into the main project.

5. **Sync with Upstream:**
   Locally merge (or rebase) the upstream development branch into your topic branch:

   ```bash
   git pull [--rebase] upstream <dev-branch>
   ```

6. **Push Your Branch:**
   Push your topic branch up to your fork:

   ```bash
   git push origin <topic-branch-name>
   ```

7. **Open a Pull Request:**
   Open a Pull Request with a clear title and description against the dev-branch.

**IMPORTANT:** By submitting a patch, you agree to allow the project owner to license your work under the same license as that used by the project.

### Running the Package Locally

1. **Navigate to the source directory:**

   ```bash
   cd src
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or, if necessary
   npm install --force
   ```

3. **Set up a locally signed certificate:**

   ```bash
   npm run dev:https
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Additional Commands

- **Lint your files:**

  ```bash
  npm run lint:fix
  ```

- **Build the project before pushing:**
  ```bash
  npm run build
  ```

Branch protection and Husky will block any non-building or non-linted pushes.

### Your First Code Contribution

Unsure where to begin? You can start by looking through these beginner and help-wanted issues:

- **Beginner issues:** These issues usually require only a few lines of code and a test or two.
- **Help wanted issues:** These are more involved than beginner issues.

### Style Guide

We use Prettier for linting to maintain code consistency. Please ensure your code adheres to our Prettier configuration.

Thank you for your contribution!
