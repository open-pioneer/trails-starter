# I18N Comparsion

## Criteria

-   Complex plural support
-   Localized number and date formatting
-   [ICU Message Format](https://phrase.com/blog/posts/guide-to-the-icu-message-format/) support (?)
-   light weight
-   support for package concept
-   on runtime language detection
-   one translation file per language / page
-   active development / community
-   license

## Overview

| Lib                                                             | Downloads per Week | Bundle size (without tree shaking)                                             | License                                                                           |
| --------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| [i18next](https://github.com/i18next/i18next)                   | 3m                 | [56.3 kb minified](https://bundlephobia.com/package/i18next@22.0.2)            | [MIT license](https://github.com/i18next/i18next/blob/master/LICENSE)             |
| <br />[FormatJS](https://github.com/formatjs/formatjs)          | 1.2m               | [62.8kB minified](https://bundlephobia.com/package/react-intl@6.2.1)           | BSD-3-Clause / MIT                                                                |
| <br />[Polyglot](https://github.com/airbnb/polyglot.js)<br />   | 184k               | [35.5 kB minified](https://bundlephobia.com/package/node-polyglot@2.4.2)       | [BSD-2-Clause license](https://github.com/airbnb/polyglot.js/blob/master/LICENSE) |
| [LinguiJS](https://github.com/lingui/js-lingui/)                | 110k               | [30.9 kB minified](https://bundlephobia.com/package/@lingui/react@3.15.0)      | [MIT license](https://github.com/lingui/js-lingui/blob/main/LICENSE)              |
| [eo-locale](https://github.com/ibitcy/eo-locale)                | 166                | [5.2 kB minified](https://bundlephobia.com/package/eo-locale@7.4.2)            | [MIT license](https://github.com/ibitcy/eo-locale/blob/master/LICENSE)            |
| [messageformat](https://github.com/messageformat/messageformat) | 160k               | [82.9 kB minified](https://bundlephobia.com/package/@messageformat/core@3.0.1) | [MIT license](https://github.com/messageformat/messageformat/blob/master/LICENSE) |
| [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)     | 160k               | [2.8 kB minified](https://bundlephobia.com/package/typesafe-i18n@5.20.0)       | [MIT license](https://github.com/ivanhofer/typesafe-i18n/blob/main/LICENSE)       |

### Out of focus

-   Globalize
-   jQuery.I18n
-   vue-i18n
-   i18n-js
-   Jed (gettext style)
-   FBT
-   Fluent
-   Lisan
-   ttag
-   schummar-translate
-   Rosetta
-   Talkr
-   Nano Stores I18n

## Details

### i18next

-   most complete i18n solution with many third-party plugins ([https://www.i18next.com/overview/plugins-and-utils](https://www.i18next.com/overview/plugins-and-utils))
-   support / first-party integration for a wide range of frameworks, e.g. [react-i18n](https://react.i18next.com/)
-   support for translation file loading and user language detection
-   support for interpolation, nesting, plurals, context, gender, built-in formatting functions (Date, Number, Currency, Units..) based on the [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).
-   can be complicated if using more than basic features
-   [JSON Format](https://www.i18next.com/misc/json-format) for messages
-   well established community

### FormatJS

-   first-party React integration, [react-intl](https://formatjs.io/docs/react-intl/)
-   first-class ICU Message Format support
-   no build-in translation file loading and user language detection
-   good tooling ([CLI](https://formatjs.io/docs/tooling/cli),[eslint-plugin](https://https://formatjs.io/docs/tooling/linter),...)
-   good [TMS integration](https://formatjs.io/docs/getting-started/message-extraction/#translation-management-system-tms-integration)
-   support for [pre-compiled messages](https://formatjs.io/docs/guides/advanced-usage) into AST, reduced react-intl without parser (40% smaller)
-   react-intl: Internationalizing can be applied only in view layer such as React.Component -> [react-intl-universal](https://github.com/alibaba/react-intl-universal) for Vanilla JS
-   well established community

### Polyglot

-   light weight with minimum feature set
-   simple solutions for translation, interpolation and pluralization
-   no external dependencies
-   support for nested phrase objects
-   React integration with [Wrapper](https://github.com/nayaabkhan/react-polyglot)

### LinguiJS

-   small, robust, intuitive syntax
-   support for interpolation, plurals, date/number formats
-   uses ICU message format
-   CLI for extracting messages
-   no build-in translation loader
-   support for JS and React
-   newer smaller community, but active and helpful
-   well documented
-   TypeScript support
-   monorepo support

### eo-locale

-   support for Vanilla JS and React
-   really tiny, but small documentation, too
-   message format strictly implemented by ICU standards
-   TypeScript support
-   optimized for tree shaking
-   built with hooks and functional components only
-   support for dates, nummeric values and plurals
-   nested support

### messageformat

-   collection of packages for
    -   transpile MessageFormat strings to JS functions
    -   loader for JSON, YAML & .properties message files
    -   parser for MessageFormat strings to AST
    -   supporting date and number formatting
    -   React hooks
    -   rollup-plugin

### typesafe-i18n

-   fully type-safe and lightweight internationalization library for all your TypeScript and JavaScript projects
-   lightweight and easy to use
-   support for plurals, switch-case statements, number and date formatting
-   locale-detection
-   optimized for performance
-   generator for boilerplate code
-   official Vite support removed since 5.0 but https://stackoverflow.com/questions/72033015/how-to-integrate-typesafe-i18n-with-vite-bundler

## Links

https://www.freecodecamp.org/news/how-to-choose-a-library-for-translating-your-javascript-apps-10f68de6a1d1/

https://github.com/jpomykala/awesome-i18n

https://bestofjs.org/projects?tags=i18n

https://openbase.com/categories/js/best-javascript-internationalization-libraries

https://dev.to/adrai/i18n-in-the-multiverse-of-formats-1nip

https://phrase.com/blog/posts/the-best-javascript-i18n-libraries/

https://medium.com/i18n-and-l10n-resources-for-developers/best-libraries-for-react-i18n-5bc37c20bd63

https://phrase.com/blog/posts/localizing-javascript-react-apps-with-linguijs/
