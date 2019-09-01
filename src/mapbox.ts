import mapboxgl from 'mapbox-gl';
import { isZoned } from './helper';

export const SOURCE_MAP_ID = 'application-map';

export const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-58.36342286710557, -34.59671342235401],
  zoom: 14,
  accessToken: 'pk.eyJ1Ijoicmhpbm9hbmRyZSIsImEiOiJjanZmNHBoaDYyOGR5NDBwZmdqeTZkZ2oyIn0.KuDwHiNv6PZkRiPG4xG39A'
});

export const addSourceToMap = () => map.addSource(SOURCE_MAP_ID, {
  'type': 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [],
  }
});

export function updateSourceMap(features) {
  const sourceMap = map.getSource(SOURCE_MAP_ID);

  sourceMap.setData({
    type: 'FeatureCollection',
    features,
  });
};
