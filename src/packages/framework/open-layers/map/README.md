# @open-pioneer/ol-map

This package provides a map container component to integrate an [open layers](https://openlayers.org/) map into an open pioneer project.
Besides the component, there is a service, which handles the registration and creation of a map.

## Usage

### Map container component

To integrate a map container in a react template, place it at the point where it should appear.
The wrapping component should provide 100% height.

The component itself uses the map registry service to create the map.
Therefore a unique map id should be defined.
With this map id, the map can be used in other component via the map registry service.
For more configuration of the map see in `./ProMapContainer.tsx` and check the .

Simple integration of a map container with an map id:

```jsx
<div height="100%">
    <MapContainer mapId="map_id"></MapContainer>
</div>
```

### Map registry service

The service is registered with the name `"ol-map.MapRegistry"`.
While injecting it the common way, you can access the map via the following snippet:

```ts
// get open layers map registry
const olMapRegistry = useService("ol-map.MapRegistry");
// get mapState with a given map id
const mapState = useAsync(async () => await olMapRegistry.getMap(MAP_ID));
```
