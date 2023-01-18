# Development Guidelines

## Definitions of Done

-   Generell ist es okay in den master/main direkt zu committen
-   Code in der main branch ist "grün", d.h. automatisierte Checks sind erfolgreich
-   Gerne Branches/Pull Requests zu nutzen, wenn sinnvoll
-   Neue Features sind dokumentiert (je nach Domäne entweder in der internen Entwicklerdoku oder in den API-Docs)
-   Neue Features sollen in der Demo angewendet werden bzw. veranschaulicht werden
-   Wir nehmen uns den Code mittels Reviews gegenseitig ab
-   Code wird wo immer möglich bzw. sinnvoll automatisiert getestet

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
