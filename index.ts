import applicationMap from './applicationMap';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import turfTransformScale from '@turf/transform-scale';
import turfCentroid from '@turf/centroid';

import './style.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoicmhpbm9hbmRyZSIsImEiOiJjanZmNHBoaDYyOGR5NDBwZmdqeTZkZ2oyIn0.KuDwHiNv6PZkRiPG4xG39A';
var map = new Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v11",
  center: [-58.36342286710557, -34.59671342235401],
  zoom: 14
});

const PERCENTAGE = 0.6;
function scaleDownPolygons(polygon) {
  var scaled = turfTransformScale(polygon, PERCENTAGE)
  return scaled;
}
map.on("load", function () {
  const { features } = applicationMap.featureCollection;
  const scaledDownFeatures = features.map((feature, index) => scaleDownPolygons(feature));

  map.addSource("national-park1", {
    "type": "geojson",
    "data": {
      type: 'FeatureCollection',
      features: scaledDownFeatures
    }
  });

  map.addLayer({
      "id": "park-boundary1",
      "type": "fill",
      "source": "national-park1",
      "paint": {
          "fill-color": "#888"
      },
      "filter": ["==", "$type", "Polygon"]
  });
});