/**
 * Maps a registered interface name to a service type.
 * The interface can be reopened by client packages to add additional registrations.
 *
 * @example
 *
 * ```ts
 * declare module "@open-pioneer/runtime" {
 *    interface ServiceRegistry {
 *        // Associates the interface name with the TypeScript interface
 *        "logging.LogService": Logger;
 *    }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceRegistry {}

/**
 * A well known interface name registered with the {@link ServiceRegistry}.
 */
export type InterfaceName = keyof ServiceRegistry;

/**
 * Returns the registered service type for the given interface name.
 */
export type ServiceType<I extends InterfaceName> = ServiceRegistry[I];
