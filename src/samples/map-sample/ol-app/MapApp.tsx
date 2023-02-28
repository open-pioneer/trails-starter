// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { type MapConfigProvider } from "./services";
import { CoordinateComponent, MapComponent } from "@open-pioneer/open-layers";

export function MapApp() {
    const mapConfig = useService("config.MapConfig") as MapConfigProvider;

    return (
        <div className="map-wrapper">
            <MapComponent id="test" mapOptions={mapConfig.mapOptions}></MapComponent>
            <div className="right-bottom">
                <CoordinateComponent></CoordinateComponent>
            </div>
        </div>
    );
}
