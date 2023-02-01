import { z } from "zod";
import { BuildConfig } from "@open-pioneer/build-support";

const REFERENCE_CONFIG_SCHEMA = z.object({ name: z.string() }).strict();

const PROVIDES_CONFIG_SCHEMA = z.object({ name: z.string() }).strict();

const UI_CONFIG_SCHEMA = z.object({ references: z.array(z.string()).optional() }).strict();

const SERVICES_CONFIG_SCHEMA = z
    .object({
        provides: z
            .string()
            .or(z.array(z.string().or(PROVIDES_CONFIG_SCHEMA)))
            .optional(),
        references: z.record(z.string(), z.string().or(REFERENCE_CONFIG_SCHEMA)).optional()
    })
    .strict();

const BUILD_CONFIG_SCHEMA = z
    .object({
        styles: z.string().optional(),
        services: z.record(z.string(), SERVICES_CONFIG_SCHEMA).optional(),
        ui: UI_CONFIG_SCHEMA.optional()
    })
    .strict();

/**
 * Ensures that `value` conforms to the {@link BuildConfig} interface.
 * Throws an error if that is not the case.
 *
 * @returns `value` but casted to the appropriate type.
 */
export function verifyBuildConfigSchema(value: unknown): BuildConfig {
    return BUILD_CONFIG_SCHEMA.parse(value);
}
