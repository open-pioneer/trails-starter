import { ComponentType, FC, StrictMode } from "react";
import { CustomChakraProvider } from "@open-pioneer/chakra-integration";
import { PackageContext, PackageContextData } from "./PackageContext";

export interface ReactRootComponentProps {
    /** The actual component that contains the application. */
    Component: ComponentType;

    /** Props passed to the component. */
    componentProps: Record<string, unknown>;

    /** Container for styles and modals (usually shadow root). Changes are not supported. */
    container: Node;

    /** Package context that allows lookup of services, properties, etc. */
    packageContext: PackageContextData;
}

export const ReactRootComponent: FC<ReactRootComponentProps> = ({
    Component,
    componentProps,
    container,
    packageContext
}) => {
    return (
        <StrictMode>
            <CustomChakraProvider container={container} colorMode="light">
                <PackageContext.Provider value={packageContext}>
                    <Component {...componentProps} />
                </PackageContext.Provider>
            </CustomChakraProvider>
        </StrictMode>
    );
};
