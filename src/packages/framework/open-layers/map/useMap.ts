// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import type Map from "ol/Map";
import { useService } from "open-pioneer:react-hooks";
import { useMemo } from "react";
import { useAsync } from "react-use";

/**
 * Represents the current state of the map lookup made by {@link useMap}.
 */
export type UseMapResult =
    | { loading: boolean; map?: Map | undefined; error?: Error | undefined }
    | UseMapLoading
    | UseMapReady
    | UseMapError;

export interface UseMapLoading {
    loading: true;
    map?: undefined;
    error?: undefined;
}

export interface UseMapReady {
    loading: false;
    map: Map;
    error?: undefined;
}

export interface UseMapError {
    loading: false;
    map?: undefined;
    error: Error;
}

/**
 * React hooks that looks up the map with the given id in the `ol-map.MapRegistry` service.
 *
 * Returns an object representing the progress, which will eventually represent either
 * the map value or an initialization error.
 *
 * The map cannot be returned directly because it may not have completed its initialization yet.
 */
export function useMap(mapId: string): UseMapResult {
    const mapRegistry = useService("ol-map.MapRegistry");
    const state = useAsync(() => mapRegistry.getMap(mapId), [mapRegistry, mapId]);
    const result = useMemo(() => {
        if (state.loading) {
            return { loading: true };
        }
        if (state.value) {
            return { loading: false, map: state.value };
        }
        if (state.error) {
            return { loading: false, error: state.error };
        }
        throw new Error(`Unexpected state (expected either loading, value or error).`);
    }, [state]);
    return result;
}
