import { Service, ServiceConstructor } from "@open-pioneer/runtime";

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
}

type PartialServiceReferences<References> = {
    [referenceName in keyof References]?: Partial<References[referenceName]>;
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
    return new clazz({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        references: (options?.references ?? {}) as any,
        properties: options?.properties ?? {}
    });
}
