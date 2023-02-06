import {
    CSSReset,
    DarkMode,
    EnvironmentProvider,
    extendTheme,
    GlobalStyle,
    LightMode,
    theme as baseTheme,
    ThemeProvider,
    ToastOptionProvider,
    ToastProvider,
    ToastProviderProps
} from "@chakra-ui/react";
import createCache, { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { FC, PropsWithChildren, useLayoutEffect, useRef } from "react";

export type CustomChakraProviderProps = PropsWithChildren<{
    /**
     * Container node where styles will be mounted.
     * Note that updates of this property are not supported.
     *
     * This is typically the shadow root.
     */
    container: Node;

    /**
     * Configures the color mode of the application.
     */
    colorMode?: "light" | "dark";
}>;

const theme = extendTheme({
    styles: {
        global: {
            // Apply the same styles to the application root node that chakra would usually apply to the body.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ".chakra-host": (baseTheme.styles.global as Record<string, any>).body
        }
    }
});

// https://github.dev/chakra-ui/chakra-ui/blob/80971001d7b77d02d5f037487a37237ded315480/packages/components/color-mode/src/color-mode.utils.ts#L3-L6
const colorModeClassnames = {
    light: "chakra-ui-light",
    dark: "chakra-ui-dark"
};

// https://github.com/chakra-ui/chakra-ui/issues/2439
// https://github.com/chakra-ui/chakra-ui/issues/2802
export const CustomChakraProvider: FC<CustomChakraProviderProps> = ({
    container,
    colorMode,
    children
}) => {
    /* 
        Chakra integration internals:

        1. Setting the emotion cache to render into 'container' instead of the document by default.
           This encapsulates the styles in the shadow root and ensures that components in the shadow dom
           are rendered correctly.

        2. Handling the color mode on our own. Chakra's default behavior will inject class names & data
           globally into the document's html / body nodes.

           NOTE: Color mode is not initialized from the system automatically right now, this can be added in the future.

        3. Changing the location for toasts to render inside the shadow root instead of the host document.

        NOTE:
            The implementation below <CacheProvider> is taken from 
                https://github.dev/chakra-ui/chakra-ui/blob/80971001d7b77d02d5f037487a37237ded315480/packages/components/provider/src/chakra-provider.tsx#L89-L102
            and
                https://github.dev/chakra-ui/chakra-ui/blob/80971001d7b77d02d5f037487a37237ded315480/packages/components/react/src/chakra-provider.tsx#L31-L33

            Essentially, we do pretty much the same thing as the ChakraProvider, but manually.
    */

    const cacheRef = useRef<EmotionCache>();
    if (!cacheRef.current) {
        cacheRef.current = createCache({
            key: "css",
            container: container
        });
    }

    const chakraHost = useRef<HTMLDivElement>(null);
    const toastOptions: ToastProviderProps = {
        /** TODO: Verify where dialogs and toasts open in the DOM */
        portalProps: {
            containerRef: chakraHost
        }
    };

    const mode = colorMode ?? "light";
    useLayoutEffect(() => {
        const host = chakraHost.current;
        if (!host) {
            return;
        }

        // https://github.dev/chakra-ui/chakra-ui/blob/80971001d7b77d02d5f037487a37237ded315480/packages/components/color-mode/src/color-mode.utils.ts#L16-L25
        const className = colorModeClassnames[mode];
        host.classList.add(className);
        host.dataset.theme = mode;
        return () => {
            host.classList.remove(className);
            host.dataset.theme = undefined;
        };
    }, [mode]);
    const ColorMode = mode === "light" ? LightMode : DarkMode;

    return (
        <div className="chakra-host" ref={chakraHost} style={{ width: "100%", height: "100%" }}>
            <CacheProvider value={cacheRef.current}>
                <ThemeProvider theme={theme}>
                    <EnvironmentProvider>
                        <ColorMode>
                            <CSSReset />
                            <GlobalStyle />
                            <ToastOptionProvider value={toastOptions?.defaultOptions}>
                                {children}
                            </ToastOptionProvider>
                            <ToastProvider {...toastOptions} />
                        </ColorMode>
                    </EnvironmentProvider>
                </ThemeProvider>
            </CacheProvider>
        </div>
    );
};

export * from "@chakra-ui/react";
