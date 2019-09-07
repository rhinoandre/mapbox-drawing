import transformFeatures from './transformFeatures'
import { updateSourceMap } from './mapbox';
import { isZoned } from './helper';
import { updateLayersToMap, LAYER_COLORS } from './layer';

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

export default function drawApplication(features, mode, applicationMap) {
  const {
    plainProperty,
    zonedProperty,
  } = applicationMap;

  const transformedFeatures = transformFeatures(features, mode);
  updateSourceMap(transformedFeatures);

  // Get the zones from the zoned or plain property given the last selected mode
  const zones = isZoned(mode) ? zonedProperty.zones : plainProperty.zones;
  // Split the feature by ids into the zones
  const featuresByZone = getIdsFromZones(zones, features, mode);

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

  // Finally add the layer
  updateLayersToMap(layers, mode);
}