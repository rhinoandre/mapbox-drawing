import transformFeatures from './transformFeatures'
import { updateSourceMap } from './mapbox';
import { isZoned } from './helper';
import { updateLayersToMap, LAYER_COLORS } from './layer';

export default function drawApplication(features, mode, applicationMap) {
  const {
    plainProperty,
    zonedProperty,
  } = applicationMap;

  const transformedFeatures = transformFeatures(features, mode);
  updateSourceMap(transformedFeatures);

  // Get the zones from the zoned or plain property given the last selected mode
  const zones = isZoned(mode) ? zonedProperty.zones : plainProperty.zones;

  // Finally add the layer
  updateLayersToMap(zones, mode);
}