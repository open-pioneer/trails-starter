# @open-pioneer/ol-layer-control

This package provides a layer-control component based on open layers, which can be integrated besides a map to handle some functionality (toggling, opacity, ...) for the configured layers.

## Usage

### Map container component

Simply place the layer control component somewhere in your react template and add at least the mapId property, so that the layer control gets the corresponding map.

See here a simple integration of a layer control with a map id and visible opacity slider:

```jsx
<LayerControlComponent mapId="map_id" showOpacitySlider={true} />
```

For more configuration of the layer control check `./LayerControlComponent.tsx`.
