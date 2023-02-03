import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import { FC, PropsWithChildren, useRef } from "react";
import createCache, { EmotionCache } from "@emotion/cache";

export type CustomChakraProviderProps = PropsWithChildren<{
    /**
     * Container node where styles will be mounted.
     * Note that updates of this property are not supported.
     */
    container: Node;
}>;

export const CustomChakraProvider: FC<CustomChakraProviderProps> = ({ container, children }) => {
    const containerRef = useRef(container);
    const cacheRef = useRef<EmotionCache>();
    if (!cacheRef.current) {
        cacheRef.current = createCache({
            key: "open-pioneer",
            container: container
        });
    }

    return (
        // Setting the emotion cache to render into 'container' instead of the document by default.
        // This encapsulates the styles in the shadow root and ensures that components in the shadow dom
        // are rendered correctly.
        <CacheProvider value={cacheRef.current}>
            <ChakraProvider
                toastOptions={{
                    /** TODO: Verify where dialogs and toasts open in the DOM */
                    portalProps: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        containerRef: containerRef as any
                    }
                }}
            >
                {children}
            </ChakraProvider>
        </CacheProvider>
    );
};

export * from "@chakra-ui/react";
