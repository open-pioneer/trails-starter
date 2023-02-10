/**
 * Automatically detects the contents of an app and provides the necessary generated data structures
 * to create a web component.
 *
 * This special module can only be imported from an `app.{ts,js,...}` file.
 */
declare module "open-pioneer:app" {
    import { type PackageMetadata, type ObservableBox } from "@open-pioneer/runtime/metadata";

    /**
     * Metadata for packages contained in the app.
     */
    declare const packages: Record<string, PackageMetadata>;

    /**
     * Combined styles of all packages contained in the app.
     */
    declare const styles: ObservableBox<string>;
}

/**
 * Provides react hooks to a module.
 * The module must be inside a valid pioneer package (or app).
 *
 * The generated hooks will ensure that hooks return data structures and services
 * for the correct package, and that dependency declarations are valid.
 */
declare module "open-pioneer:react-hooks" {
    // eslint-disable-next-line unused-imports/no-unused-imports
    import { type ServiceType, type InterfaceName } from "@open-pioneer/runtime";
    import { type UseServiceOptions } from "@open-pioneer/react-integration";
    export { type UseServiceOptions };

    /**
     * Returns an implementation of the given interface.
     *
     * A complete interface name is required (e.g. "logging.LogService").
     *
     * In order to use a service, it must be declared as an UI-dependency in the package's configuration file.
     */
    export function useService<IFace extends InterfaceName>(
        interfaceName: IFace,
        options?: UseServiceOptions
    ): ServiceType<IFace>;
    export function useService(serviceName: string, options?: UseServiceOptions): unknown;

    /**
     * Returns all implementations of the given interface.
     *
     * A complete interface name is required (e.g. "logging.LogService").
     *
     * In order to use all services, it must be declared as an UI-dependency (`all: true`) in the package's configuration file.
     */
    export function useServices<InterfaceName extends InterfaceName>(
        interfaceName: InterfaceName
    ): ServiceType<InterfaceName>[];
    export function useServices(serviceName: string): unknown[];

    /**
     * Returns the properties of the calling component's package.
     */
    export function useProperties(): Readonly<Record<string, unknown>>;
}
