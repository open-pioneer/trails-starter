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
    const cacheRef = useRef<EmotionCache>();
    if (!cacheRef.current) {
        cacheRef.current = createCache({
            key: "open-pioneer",
            container: container
        });
    }

    return (
        <CacheProvider value={cacheRef.current}>
            <ChakraProvider>{children}</ChakraProvider>
        </CacheProvider>
    );
};

export * from "@chakra-ui/react";
