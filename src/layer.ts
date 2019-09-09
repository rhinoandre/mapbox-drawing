import { isZoned } from './helper';
import { map, SOURCE_MAP_ID } from './mapbox';

export const LAYER_COLORS = ['#000000', '#d7ca93', '#c2e377', '#ffcf01', '#ff8228', '#f44b4f'];

function circleRadiusForGridSize(gridSize) {
  if (gridSize <= 0.02) {
    return ['interpolate', ['linear'], ['zoom'], 8, 1, 14, 2, 16, 8, 20, 36];
  }
  if (gridSize <= 0.03) {
    return ['interpolate', ['linear'], ['zoom'], 8, 1, 14, 2, 16, 9, 20, 38];
  }
  if (gridSize <= 0.05) {
    return ['interpolate', ['linear'], ['zoom'], 8, 1, 14, 2, 16, 12, 20, 48];
  }
  if (gridSize <= 0.08) {
    return ['interpolate', ['linear'], ['zoom'], 8, 1, 12, 3, 14, 8, 16, 24, 20, 56];
  }
}

function createColoredLayer({ index, amount, color }, mode = '', gridSize = 0.02) {
  const layer: any = {
    id: `colored-${index}`,
    source: SOURCE_MAP_ID,
    type: 'circle',
    paint: {
      'circle-color': color,
      'circle-radius': circleRadiusForGridSize(gridSize),
    },
    filter: ['any', ['in', 'N', amount.toString()], ['in', 'N', amount]],
  };

  if (isZoned(mode)) {
    layer.type = 'fill';
    layer.paint = {
      'fill-color': color,
    };
    layer.filter = ['==', ['get', 'N', ['get', 'zoned']], amount];
  }

  return layer;
}

export function addLayersToMap() {
  LAYER_COLORS.forEach((color, index) => {
    const layerObject = createColoredLayer({ index, amount: 0, color });
    map.addLayer(layerObject);
  })
}

function createLayers(zones) {
  return LAYER_COLORS.map((color, index) => ({
    color,
    index,
    amount: zones[index].value
  }));
}

export function updateLayersToMap(zones, mode) {
  // Create the layers
  const layers = createLayers(zones);

  // update layers by mutating the style
  // since mapbox doesn't have a dedicated method
  const style = map.getStyle();
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