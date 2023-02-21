import { createIntl, createIntlCache, IntlCache, IntlShape } from "@formatjs/intl";
import { ErrorId } from "./errors";
import { Error } from "@open-pioneer/core";
import { ApplicationMetadata } from "./metadata";

/**
 * Represents i18n info for the entire application.
 * Currently not exposed to user code.
 */
export interface AppI18n {
    /** Chosen locale */
    readonly locale: string;

    /** Given the package name, constructs a package i18n instance. */
    createPackageI18n(packageName: string): PackageI18n;
}

/**
 * Gives access to the package's i18n messages for the current locale.
 */
export interface PackageI18n {
    /** The current locale. */
    readonly locale: string;

    formatMessage(options: { id: string }, values?: Record<string, unknown>): string;
}

export class PackageI18nImpl implements PackageI18n {
    readonly locale: string;
    readonly #cache: IntlCache;
    readonly #intl: IntlShape;

    constructor(locale: string, messages: Record<string, string>) {
        this.locale = locale;
        this.#cache = createIntlCache();
        this.#intl = createIntl(
            {
                locale,
                messages
                // TODO: defaultLocale etc
            },
            this.#cache
        );
    }

    formatMessage(options: { id: string }, values?: Record<string, unknown> | undefined): string {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.#intl.formatMessage(options, values as any);
    }
}

/**
 * Initializes the application's locale and fetches the appropriate i18n messages.
 */
export async function initI18n(appMetadata: ApplicationMetadata | undefined): Promise<AppI18n> {
    const supportedLocales = appMetadata?.locales ?? [];
    const loadMessages = appMetadata?.loadMessages;

    // TODO:
    //  - Allow customization of locale
    const locale = chooseAppLocale(undefined, supportedLocales);

    let messages: Record<string, Record<string, string>>;
    if (supportedLocales.includes(locale)) {
        try {
            messages = (await loadMessages?.(locale)) ?? {};
        } catch (e) {
            throw new Error(ErrorId.INTERNAL, `Failed to load messages for locale '${locale}'.`, {
                cause: e
            });
        }
    }
    return {
        locale,
        createPackageI18n(packageName) {
            const packageMessage = messages?.[packageName] ?? {};
            return new PackageI18nImpl(locale, packageMessage);
        }
    };
}

/** Creates an empty i18n instance, e.g. for tests. */
export function createEmptyI18n(locale = "en"): PackageI18n {
    return {
        locale,
        formatMessage({ id }) {
            return id;
        }
    };
}

/**
 * Decides the locale for the app.
 */
function chooseAppLocale(forcedLocale: string | undefined, supportedLocales: string[]): string {
    if (forcedLocale) {
        if (!supportedLocales.includes(forcedLocale)) {
            throw new Error(
                ErrorId.UNSUPPORTED_LOCALE,
                `Locale '${forcedLocale}' cannot be forced because it is not supported by the application. Supported locales are '${supportedLocales.join(
                    ","
                )}'.`
            );
        }
        return forcedLocale;
    }

    // TODO: Inspect browser locale, get default locale from app
    return supportedLocales[0] ?? "en";
}
