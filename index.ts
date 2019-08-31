import applicationMap from './applicationMap';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import turfTransformScale from '@turf/transform-scale';
import turfCentroid from '@turf/centroid';

import './style.css';

const LAYER_COLORS = ['#000000', '#d7ca93', '#c2e377', '#ffcf01', '#ff8228', '#f44b4f'];
const SOURCE_MAP_ID = 'application-map';

mapboxgl.accessToken = 'pk.eyJ1Ijoicmhpbm9hbmRyZSIsImEiOiJjanZmNHBoaDYyOGR5NDBwZmdqeTZkZ2oyIn0.KuDwHiNv6PZkRiPG4xG39A';
var map = new Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v11',
  center: [-58.36342286710557, -34.59671342235401],
  zoom: 14
});

const PERCENTAGE = 0.6;
function scaleDownPolygons(polygon) {
  var scaled = turfTransformScale(polygon, PERCENTAGE)
  return scaled;
}

const getFeaturesWithId = (features) => features.filter(({ properties }) => properties.id);

function getIdsFromZones(zones, features, mode) {
  const nFeatureIds = zones.reduce((acc, zone) => {
    acc[zone.value] = [];
    return acc;
  }, {});

  features.forEach(({ properties }) => {
    const property = 'N';
    if (isZoned(mode)) {
      if (properties.id && properties.zoned[property]) {
        nFeatureIds[properties.zoned[property]].push(properties.id);
      }
    } else {
      if (properties.id && properties[property]) {
        nFeatureIds[properties[property]].push(properties.id);
      }
    }
  });

  return nFeatureIds;
}

const isZoned = (mode) => mode === 'ZONED';

function createColoredLayer({ index, amount, color }, mode='', gridSize = 0.02) {
  return {
    id: `colored-${index}`,
    type: 'fill',
    source: 'application-map',
    paint: {
      'fill-color': color,
    },
    filter: [
      'any',
      isZoned(mode) ?
        ['==', ['get', 'N', ['get', 'zoned']], amount] :
        ['==', 'N', amount],
    ],
  }
};

function addLayersToMap() {
  LAYER_COLORS.forEach((color, index) => {
    const layerObject = createColoredLayer({index, amount: 0, color});
    map.addLayer(layerObject);
  })
}
function updateLayersToMap(layers, mode) {
  const style = map.getStyle();

  // update layers by mutating the style
  // since mapbox doesn't have a dedicated method
  layers.forEach((newLayer) => {
      const layerObject = createColoredLayer(newLayer, mode);
      const index = style.layers.findIndex((layer) => layer.id === layerObject.id);

      if (index === -1) {
          console.warn('layer not found');
      } else {
          style.layers[index] = layerObject;
      }
  });

  map.setStyle(style);
}

const addSourceToMap = () => map.addSource(SOURCE_MAP_ID, {
  'type': 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [],
  }
});

const updateSourceMap = (features) => {
  const sourceMap = map.getSource(SOURCE_MAP_ID);

  sourceMap.setData({
    type: 'FeatureCollection',
    features,
  });
}

map.on('load', function () {
  const { lastSelectedMode, featureCollection: { features }, plainProperty, zonedProperty } = applicationMap;
  addSourceToMap();
  addLayersToMap();

  // The only features that are needed are the ones who has an ID in its properties
  let filteredFeatures = getFeaturesWithId(features);

  // Scale down the polygons to show an space between them
  // MODE: Zoned
  const scaledDownFeatures = filteredFeatures.map((feature, index) => scaleDownPolygons(feature));
  updateSourceMap(scaledDownFeatures);

  // Get the zones from the zoned or plain property given the last selected mode
  const zones = isZoned(lastSelectedMode) ? zonedProperty.zones : plainProperty.zones;
  // Split the feature by ids into the zones
  const featuresByZone = getIdsFromZones(zones, features, lastSelectedMode);

  // For fast access create an object to get the amount of N based on the feature ID
  // This will be used when using the brush to change the N value for the features
  const featureIds = {};
  Object.keys(featuresByZone).forEach((amountN) => {
    featuresByZone[amountN].forEach((id) => {
      featureIds[id] = amountN;
    });
  });

  // Create the layers
  const layers = LAYER_COLORS.map((color, index) => ({ color, index, amount: '' }));
  // Update the amount that each color represents on the layer
  zones.forEach(({ id, value }) => layers[id].amount = value);
  console.log(layers)

  // Finally add the layer
  updateLayersToMap(layers, lastSelectedMode);
});