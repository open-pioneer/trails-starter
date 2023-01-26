import { Coordinate, toStringXY } from "ol/coordinate";
import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import { RefObject, useEffect, useRef, useState } from "react";

export function MapApp() {
    const [selectedCoord, setSelectedCoord] = useState<Coordinate>();

    const mapElement = useRef<HTMLDivElement>(null);

    const map = useMap(mapElement);

    if (map) {
        map.on("pointermove", (event: MapBrowserEvent<UIEvent>) => {
            const clickedCoord = map.getCoordinateFromPixel(event.pixel);
            if (clickedCoord) {
                const transormedCoord = transform(clickedCoord, "EPSG:3857", "EPSG:4326");
                setSelectedCoord(transormedCoord);
            }
        });
    }

    return (
        <div className="map-wrapper">
            <div ref={mapElement} className="map-container"></div>

            {selectedCoord && (
                <div className="clicked-coord-label">{toStringXY(selectedCoord, 5)}</div>
            )}
        </div>
    );
}

function useMap(domNode: RefObject<HTMLDivElement>) {
    const [map, setMap] = useState<Map | null>(null);
    const mapRef = useRef<Map>();

    useEffect(() => {
        if (!mapRef.current && domNode.current) {
            const initialMap = new Map({
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
                controls: []
            });
            mapRef.current = initialMap;
            setMap(initialMap);
        }

        // destroy map
        return () => {
            mapRef.current?.dispose();
            mapRef.current = undefined;
            setMap(null);
        };
    }, [domNode]);

    return map;
}
