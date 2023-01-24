# Development Guidelines

## Definitions of Done

-   It is okay to commit to the main branch directly (pull requests or branches can of course be used when appropriate)
-   The code in main branch is supposed to build correctly and pass all quality checks (linting, typescript, etc.)
-   New features are always documented (internally and/or externally)
-   New features should be demonstrated via the demo deployment
-   We review each other's code before closing an issue
-   Automated tests are written wherever possible (and sensible)

## Code style

-   Use eslint & prettier rules (reconfigure if necessary)
-   Make sure that your code passes the linter, the typescript compiler and the test suite
    before committing to the main branch.
-   Prefer const over let by default
-   Max line length is 100 columns (with some leeway)

## Git setup

-   Keep a linear history if possible.
    Use either `git pull --rebase` or setup `git config --global pull.rebase true` to make rebasing the default behavior.
-   Always use UTF-8 text encoding
-   Use Unix style newlines.
    When developing on windows, configure git to replace accidentally introduced Windows-style newlines on commit:
    `git config --global core.autocrlf input` (see https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration)
