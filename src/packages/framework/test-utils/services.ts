// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { ReferenceMeta, Service, ServiceConstructor } from "@open-pioneer/runtime";
import { createIntl, createIntlCache } from "@formatjs/intl";

/**
 * Options for the {@link createService} function.
 */
export interface CreateServiceOptions<References> {
    /**
     * References provided to the service constructor.
     *
     * @default {}
     */
    references?: PartialServiceReferences<References>;

    /**
     * Properties provided to the service constructor.
     *
     * @default {}
     */
    properties?: Record<string, unknown>;

    /**
     * The locale for i18n messages and formatting.
     *
     * @default "en"
     */
    locale?: string;

    /**
     * The locale for embedded default messages.
     *
     * See also https://formatjs.io/docs/intl#message-descriptor
     *
     * @default "en"
     */
    defaultMessageLocale?: string;

    /**
     * I18n messages as (messageId, message) entries.
     *
     * @default {}
     */
    messages?: Record<string, string>;
}

type PartialServiceReferences<References> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [referenceName in keyof References]?: References[referenceName] extends any[]
        ? Partial<References[referenceName][number]>[]
        : Partial<References[referenceName]>;
};

/**
 * Creates a new service instance of `clazz`.
 *
 * The options passed into the constructor of `clazz` are taking from the `options` parameter.
 *
 * This function allows the user to define mock- or test objects as service references.
 *
 * Most type-checking features are disabled for convenience, but by default this function's types
 * enforce that a value provided for a reference must match the partial interface of the actually required type.
 *
 * For example, if a service depends on `{ ctx: ApplicationContext }`, this function ensures
 * that the test value for `ctx` implements `Partial<ApplicationContext>`.
 * This can of course be disabled by casting the value explicitly.
 *
 * @param clazz a service class
 * @param options options passed to the service constructor
 * @returns a new instance of the given service class
 */
export async function createService<References extends {}, Interface extends {}>(
    clazz: ServiceConstructor<References, Interface>,
    options?: CreateServiceOptions<References>
): Promise<Service<Interface>> {
    const references = options?.references ?? {};
    const referencesMeta = Object.fromEntries(
        Object.entries(references).map(([referenceName, reference]) => [
            referenceName,
            referenceMeta(referenceName, reference)
        ])
    );

    const locale = options?.locale ?? "en";
    const defaultMessageLocale = options?.defaultMessageLocale ?? "en";
    const messages = options?.messages ?? {};
    const cache = createIntlCache();
    const intl = createIntl(
        {
            locale,
            defaultLocale: defaultMessageLocale,
            messages
        },
        cache
    );

    return new clazz({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        references: references as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        referencesMeta: referencesMeta as any,
        properties: options?.properties ?? {},
        intl
    });
}

function referenceMeta(referenceName: string, reference: unknown): ReferenceMeta | ReferenceMeta[] {
    if (Array.isArray(reference)) {
        return reference.map<ReferenceMeta>((_, index) => ({
            serviceId: `test-utils::${referenceName}-${index}`
        }));
    }
    return {
        serviceId: `test-utils::${referenceName}`
    };
}
