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
import Layer from "ol/layer/Layer";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";
import { useAsync } from "react-use";

import { OlComponentConfig } from "@open-pioneer/open-layers-map";

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
        const curr = props.layer.getOpacity() * 100;
        if (curr !== sliderValue) {
            props.layer.setOpacity(sliderValue / 100);
        }
    }, [props.layer, sliderValue]);

    return (
        <Slider
            id="slider"
            defaultValue={sliderValue}
            min={0}
            max={100}
            colorScheme="teal"
            onChange={(v) => setSliderValue(v)}
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
