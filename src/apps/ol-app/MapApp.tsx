import { useService } from "@open-pioneer/runtime/ComponentContext";
import { Coordinate, toStringXY } from "ol/coordinate";
import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import { RefObject, useEffect, useRef, useState } from "react";
import { MapConfigProvider } from "./app";

export function MapApp() {
    const [selectedCoord, setSelectedCoord] = useState<Coordinate>();

    const mapElement = useRef<HTMLDivElement>(null);

    const service = useService("logging.LogService");

    const mapConfig = useService("config.MapConfig") as MapConfigProvider;

    const map = useMap(mapElement, mapConfig);

    useEffect(() => {
        if (map) {
            map.on("click", (event: MapBrowserEvent<UIEvent>) => {
                const coords = map.getCoordinateFromPixel(event.pixel);
                if (coords) {
                    const transformedCoord = transform(coords, "EPSG:3857", "EPSG:4326");
                    service.log(
                        `Coordinate ${coords} clicked and transformed to ${transformedCoord}`
                    );
                    setSelectedCoord(transformedCoord);
                }
            });
        }
    }, [map, service]);

    return (
        <div className="map-wrapper">
            <div ref={mapElement} className="map-container"></div>

            {selectedCoord && (
                <div className="clicked-coord-label">{toStringXY(selectedCoord, 5)}</div>
            )}
        </div>
    );
}

function useMap(domNode: RefObject<HTMLDivElement>, mapConfig: MapConfigProvider) {
    const [map, setMap] = useState<Map | null>(null);
    const mapRef = useRef<Map>();

    useEffect(() => {
        if (!mapRef.current && domNode.current) {
            const localConfig = {
                target: domNode.current,
                layers: [
                    new TileLayer({
                        source: new XYZ({
                            url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
                        })
                    })
                ],
                view: new View({
                    projection: "EPSG:3857",
                    center: [0, 0],
                    zoom: 2
                }),
                ...mapConfig.mapOptions
            };
            const initialMap = new Map(localConfig);
            mapRef.current = initialMap;
            setMap(initialMap);
        }

        // destroy map
        return () => {
            mapRef.current?.dispose();
            mapRef.current = undefined;
            setMap(null);
        };
    }, [domNode, mapConfig]);

    return map;
}
