// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
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
