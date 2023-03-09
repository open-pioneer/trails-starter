// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import {
    Checkbox,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Tooltip
} from "@open-pioneer/chakra-integration";
import { OlComponentConfig } from "@open-pioneer/open-layers-map";
import Layer from "ol/layer/Layer";
import { unByKey } from "ol/Observable";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";
import { useAsync } from "react-use";

function LayerVisibilityTogglerComponent(props: { layer: Layer }) {
    const intl = useIntl();
    const [visibility, setVisibility] = useState<boolean>(props.layer.getVisible());
    const title =
        props.layer.getProperties().title ?? intl.formatMessage({ id: "undefined-layer-title" });

    const changeVisibility = () => {
        setVisibility(!visibility);
        props.layer.setVisible(!visibility);
    };

    return (
        <Checkbox size="lg" isChecked={visibility} onChange={changeVisibility}>
            {title}
        </Checkbox>
    );
}

function LayerOpacitySliderComponent(props: { layer: Layer }) {
    const [sliderValue, setSliderValue] = useState(props.layer.getOpacity() * 100);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const opacityChangeListener = props.layer.on("change:opacity", () => {
            const opacity = props.layer.getOpacity() * 100;
            if (opacity !== sliderValue) {
                setSliderValue(Math.round(opacity));
            }
        });
        return () => unByKey(opacityChangeListener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Slider
            id="slider"
            value={sliderValue}
            min={0}
            max={100}
            colorScheme="teal"
            onChange={(v) => props.layer.setOpacity(v / 100)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
                hasArrow
                bg="teal.500"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={`${sliderValue}%`}
            >
                <SliderThumb bg="teal.500"></SliderThumb>
            </Tooltip>
        </Slider>
    );
}

interface LayerControlConfig extends OlComponentConfig {
    showOpacitySlider: boolean;
}

export function LayerControlComponent(config: LayerControlConfig) {
    const olMapRegistry = useService("open-layers-map-service");

    const state = useAsync(async () => {
        const map = await olMapRegistry.getMap(config.mapId);
        const layers = map.getAllLayers().reverse();
        return layers;
    }, []);

    return (
        <div>
            {state.loading ? (
                <div>Loading...</div>
            ) : state.error ? (
                <div>Error: {state.error.message}</div>
            ) : (
                <div>
                    {state.value?.map((layer, i) => (
                        <div key={i}>
                            <LayerVisibilityTogglerComponent
                                layer={layer}
                            ></LayerVisibilityTogglerComponent>
                            {config.showOpacitySlider && (
                                <div>
                                    <LayerOpacitySliderComponent
                                        layer={layer}
                                    ></LayerOpacitySliderComponent>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
