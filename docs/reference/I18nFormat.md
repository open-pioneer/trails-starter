# I18N Files

## File Format

I18N files use [YAML](https://yaml.org/) syntax and must conform to the schema defined in this document.

I18N files are typically located in a package (or app) within the `i18n` directory.
The file name contains the supported language, for example `en.yaml`.

### Messages

Defines message ids and associated values.
Values must either be strings or nested objects.
Message ids in nested objects are automatically concatenated with `"."`.

Example:

```yaml
# lang.yaml
messages:
    content.header: "A header"
    greeting: "Hello {name}"
    dialog:
        title: "A title"
```

The messages defined above can be referenced by their ids `content.header` and `dialog.title`.

### Overrides

This property allows an application to override i18n messages defined in other packages, or to define entirely new languages without modifying its dependencies.
`overrides` is only allowed in the application's package.

Example:

The following `overrides` block overrides the message `message.id` in the package `some-package-name` with the given replacement value.
Like in the `messages` block, nested objects can be used where the format expects messages.

```yaml
# lang.yaml
overrides:
    some-package-name:
        message.id: "Replacement message"
```

## FormatJS

At runtime, all messages are made available on an `intl` object provided by the [FormatJS Library](https://formatjs.io/).
Message templates can use the [message syntax](https://formatjs.io/docs/core-concepts/icu-syntax) supported by FormatJS.

Use the `formatMessage` method on an `intl` object to format an i18n message:

```js
const header = intl.formatMessage({ id: "content.header" }); // "A header"
const greeting = intl.formatMessage({ id: "greeting" }, { name: "User" }); // "Hello User"
```

FormatJS also provides facilities to format numbers, dates etc. in the appropriate locale, see also [Documentation](https://formatjs.io/docs/intl#intlshape).
