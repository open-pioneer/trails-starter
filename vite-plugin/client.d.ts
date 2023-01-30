/**
 * Automatically detects the contents of an app and provides the necessary generated data structures
 * to create a web component.
 *
 * This special module can only be imported from an `app.{ts,js,...}` file.
 */
declare module "open-pioneer:app" {
    import { type PackageMetadata } from "@open-pioneer/runtime/metadata";

    /**
     * Metadata for packages contained in the app.
     */
    declare const packages: Record<string, PackageMetadata>;

    /**
     * Combined styles of all packages contained in the app.
     */
    declare const styles: string;
}

declare module "open-pioneer:react-hooks" {
    import { type ServiceRegistry } from "@open-pioneer/runtime";

    /**
     * Returns a service which is defined in the packages section as a reference in {@link CustomElementOptions}.
     *
     * A complete service name with package declaration is needed (e.g. "logging.LogService").
     */
    export function useService<ServiceName extends keyof ServiceRegistry>(
        serviceName: ServiceName
    ): ServiceRegistry[ServiceName];
    export function useService(serviceName: string): unknown;
}
