import { z } from "zod";
import {
    BuildConfig,
    PropertyMetaConfig,
    ProvidesConfig,
    ReferenceConfig,
    ServiceConfig,
    UiConfig
} from "@open-pioneer/build-support";
import { fromZodError } from "zod-validation-error";

const LITERAL_SCHEMA = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Literal = z.infer<typeof LITERAL_SCHEMA>;

type Json = Literal | { [key: string]: Json } | Json[];

const JSON_SCHEMA: z.ZodType<Json> = z.lazy(() =>
    z.union([LITERAL_SCHEMA, z.array(JSON_SCHEMA), z.record(JSON_SCHEMA)])
);

const PROPERTY_META_SCHEMA: z.ZodType<PropertyMetaConfig> = z.strictObject({
    required: z.boolean().optional()
});

const REFERENCE_CONFIG_SCHEMA: z.ZodType<ReferenceConfig> = z.strictObject({ name: z.string() });

const PROVIDES_CONFIG_SCHEMA: z.ZodType<ProvidesConfig> = z.strictObject({
    name: z.string(),
    qualifier: z.string().optional()
});

const UI_CONFIG_SCHEMA: z.ZodType<UiConfig> = z.strictObject({
    references: z.array(z.string().or(REFERENCE_CONFIG_SCHEMA)).optional()
});

const SERVICE_CONFIG_SCHEMA: z.ZodType<ServiceConfig> = z.strictObject({
    provides: z
        .string()
        .or(z.array(z.string().or(PROVIDES_CONFIG_SCHEMA)))
        .optional(),
    references: z.record(z.string(), z.string().or(REFERENCE_CONFIG_SCHEMA)).optional()
});

const BUILD_CONFIG_SCHEMA: z.ZodType<BuildConfig> = z.strictObject({
    styles: z.string().optional(),
    services: z.record(z.string(), SERVICE_CONFIG_SCHEMA).optional(),
    ui: UI_CONFIG_SCHEMA.optional(),
    properties: z.record(z.string(), JSON_SCHEMA).optional(),
    propertiesMeta: z.record(z.string(), PROPERTY_META_SCHEMA).optional()
});

/**
 * Ensures that `value` conforms to the {@link BuildConfig} interface.
 * Throws an error if that is not the case.
 *
 * @returns `value` but casted to the appropriate type.
 */
export function verifyBuildConfigSchema(value: unknown): BuildConfig {
    const result = BUILD_CONFIG_SCHEMA.safeParse(value);
    if (result.success) {
        return result.data;
    }
    const message = fromZodError(result.error).message;
    throw new Error(message);
}
