export interface ServiceLifecycleHooks {
    /**
     * Destroy the component.
     * Should clean up all resources used by the component.
     */
    destroy?(): void;

    /*
     * Just used so that this interface is not empty.
     * TypeScript would otherwise throw an 'no common properties' error
     * if one tries to implement this interface without providing any
     * lifecycle hooks.
     */
    toString(): string;
}

export type Service<Interface extends {} = {}> = ServiceLifecycleHooks & Interface;

export type ServiceOptions<References extends {} = {}> = {
    references: References;
};

export type ServiceConstructor<References extends {} = {}, Interface extends {} = {}> = {
    new (options: ServiceOptions<References>): Service<Interface>;
};
