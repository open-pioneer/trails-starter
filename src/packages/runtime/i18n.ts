import { createIntl, createIntlCache, IntlFormatters, IntlShape } from "@formatjs/intl";
import { ErrorId } from "./errors";
import { createLogger, Error } from "@open-pioneer/core";
import { ApplicationMetadata } from "./metadata";
const LOG = createLogger("runtime:i18n");

/**
 * Represents i18n info for the entire application.
 * Currently not exposed to user code.
 */
export interface AppI18n {
    /** Chosen locale */
    readonly locale: string;

    /** Supported locales from app metadata. */
    readonly supportedLocales: string[];

    /** Given the package name, constructs a package i18n instance. */
    createPackageI18n(packageName: string): PackageIntl;
}

/**
 * Gives access to the package's i18n messages for the current locale.
 *
 * See also https://formatjs.io/docs/intl
 */
export type PackageIntl = Pick<IntlShape, "locale" | "timeZone"> & IntlFormatters<string>;

function createPackageIntl(locale: string, messages: Record<string, string>) {
    const cache = createIntlCache();
    return createIntl(
        {
            locale,
            messages
        },
        cache
    );
}

/**
 * Initializes the application's locale and fetches the appropriate i18n messages.
 */
export async function initI18n(
    appMetadata: ApplicationMetadata | undefined,
    forcedLocale: string | undefined
): Promise<AppI18n> {
    const supportedLocales = appMetadata?.locales ?? [];
    const userLocales = getBrowserLocales();
    if (LOG.isDebug()) {
        LOG.debug(
            `Attempting to pick locale for user (locales: ${userLocales.join(
                ", "
            )}) from app (supported locales: ${supportedLocales.join(
                ", "
            )}) [forcedLocale=${forcedLocale}].`
        );
    }

    const { locale, messageLocale } = pickLocale(
        forcedLocale,
        supportedLocales,
        getBrowserLocales()
    );

    if (LOG.isDebug()) {
        LOG.debug(`Using locale '${locale}' with messages from locale '${messageLocale}'.`);
    }

    let messages: Record<string, Record<string, string>>;
    if (supportedLocales.includes(messageLocale)) {
        try {
            messages = (await appMetadata?.loadMessages?.(messageLocale)) ?? {};
        } catch (e) {
            throw new Error(
                ErrorId.INTERNAL,
                `Failed to load messages for locale '${messageLocale}'.`,
                {
                    cause: e
                }
            );
        }
    }
    return {
        locale,
        supportedLocales,
        createPackageI18n(packageName) {
            const packageMessage = messages?.[packageName] ?? {};
            return createPackageIntl(locale, packageMessage);
        }
    };
}

/** Creates an empty i18n instance, e.g. for tests. */
export function createEmptyI18n(locale = "en"): PackageIntl {
    return createPackageIntl(locale, {});
}

export interface LocalePickResult {
    /** The actual locale (e.g. en-US) for number and date formatting etc. */
    locale: string;

    /**
     * The locale identifier to load messages for. E.g. "en".
     */
    messageLocale: string;
}

/**
 * Picks a locale for the app. Exported for tests.
 *
 * @param forcedLocale Optional forced locale (must be satisfied)
 * @param appLocales Locales the app has i18n messages for (e.g. "en", "de")
 * @param userLocales Locales requested by the user's browser
 */
export function pickLocale(
    forcedLocale: string | undefined,
    appLocales: string[],
    userLocales: string[]
): LocalePickResult {
    const pickImpl = (requestedLocales: string[]): LocalePickResult | undefined => {
        for (const requestedLocale of requestedLocales) {
            // try exact match
            if (appLocales.includes(requestedLocale)) {
                return { messageLocale: requestedLocale, locale: requestedLocale };
            }

            // try plain language tag (e.g. "en") as fallback
            const plainLanguage = requestedLocale.match(/^([a-z]+)/i)?.[1];
            if (plainLanguage && appLocales.includes(plainLanguage)) {
                return { messageLocale: plainLanguage, locale: requestedLocale };
            }
        }
        return undefined;
    };

    // Attempt to satisfy forced locale
    if (forcedLocale) {
        const result = pickImpl([forcedLocale]);
        if (!result) {
            const localesList = appLocales.join(", ");
            throw new Error(
                ErrorId.UNSUPPORTED_LOCALE,
                `Locale '${forcedLocale}' cannot be forced because it is not supported by the application.` +
                    ` Supported locales are ${localesList}.`
            );
        }
        if (result.locale !== result.messageLocale) {
            LOG.warn(
                `Non-exact match for forced locale '${forcedLocale}': using messages from '${result.messageLocale}'.`
            );
        }
        return result;
    }

    // Match preferred locale
    const supportedLocale = pickImpl(userLocales);
    if (supportedLocale) {
        return supportedLocale;
    }

    // Fallback: Most preferred locale (for dates etc.), but some of our messages
    return { locale: userLocales[0] ?? "en", messageLocale: appLocales[0] ?? "en" };
}

/**
 * Returns locales supported by the browser, in order of preference (preferred first).
 *
 * See also https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
 */
function getBrowserLocales(): string[] {
    if (window.navigator.languages && window.navigator.languages.length) {
        return Array.from(window.navigator.languages);
    }
    return [window.navigator.language];
}
