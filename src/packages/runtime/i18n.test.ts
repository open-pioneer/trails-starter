import { expect, it } from "vitest";
import { pickLocale } from "./i18n";

it("picks a supported locale by default", () => {
    const appLocales = ["en", "de"];
    const userLocales = ["de"];
    const result = pickLocale(undefined, appLocales, userLocales);
    expect(result).toEqual({
        locale: "de",
        messageLocale: "de"
    });
});

it("picks a supported locale by plain language name as fallback", () => {
    const appLocales = ["en", "de"];
    const userLocales = ["de-DE"];
    const result = pickLocale(undefined, appLocales, userLocales);
    expect(result).toEqual({
        locale: "de-DE",
        messageLocale: "de"
    });
});

it("picks a fallback locale if nothing can be satisfied", () => {
    const appLocales = ["en", "de"];
    const userLocales = ["zh_CN"];
    const result = pickLocale(undefined, appLocales, userLocales);
    expect(result).toEqual({
        locale: "zh_CN",
        messageLocale: "en"
    });
});

it("supports forcing a custom locale", () => {
    const appLocales = ["en", "de", "de-simple"];
    const userLocales = ["de-DE"];
    const result = pickLocale("de-simple", appLocales, userLocales);
    expect(result).toEqual({
        locale: "de-simple",
        messageLocale: "de-simple"
    });
});

it("throws if a locale cannot be forced", () => {
    const appLocales = ["en", "de"];
    const userLocales = ["de-DE"];
    expect(() =>
        pickLocale("de-simple", appLocales, userLocales)
    ).toThrowErrorMatchingInlineSnapshot(
        "\"runtime:unsupported-locale: Locale 'de-simple' cannot be forced because it is not supported by the application. Supported locales are en, de.\""
    );
});
