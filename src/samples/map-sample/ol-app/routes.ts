// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { RouterOptions, useRoute } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

const SELECTED_FEATURE_PATTERN = "/feature/:featureId";

/** Configuration for the main `<Router />` parent. */
export function useRouterOptions(): RouterOptions {
    return {
        // Client side only routing using `#/foo/bar?baz=123` urls
        hook: useHashLocation
    };
}

/** Returns the ID of the currently selected feature from the current URL, or `undefined`. */
export function useCurrentFeatureId(): string | undefined {
    const [match, params] = useRoute(SELECTED_FEATURE_PATTERN);
    if (!match) {
        return undefined;
    }
    return params.featureId;
}

/** Generates a URL that points to the given feature id. */
export function getFeatureUrl(featureId: string | undefined) {
    if (!featureId) {
        return "/";
    }
    return `/feature/${featureId}`;
}
