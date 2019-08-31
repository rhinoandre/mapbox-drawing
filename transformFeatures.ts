import turfTransformScale from '@turf/transform-scale';
import turfCentroid from '@turf/centroid';
import { isZoned } from './helper';

const PERCENTAGE = 0.6;
function scaleDownPolygons(polygons) {
  // Scale down the polygons to show an space between them
  return polygons.map((polygon) => turfTransformScale(polygon, PERCENTAGE));
}

function getPoints(features) {
  return features.map(feature => {
    const point = turfCentroid(feature);
    point.properties = { ...feature.properties };
    return point;
  });;
}

export default function transformFeatures(features, mode) {
  if (isZoned(mode)) {
    return scaleDownPolygons(features)
  }

  return getPoints(features);
}