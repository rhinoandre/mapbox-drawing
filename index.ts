import { isZoned } from './src/helper';
import { map, addSourceToMap, updateSourceMap, SOURCE_MAP_ID } from './src/mapbox';
import { addLayersToMap } from './src/layer';
import drawApplication from './src/draw';
import applicationMap from './src/applicationMap';

import './style.css';

const getFeaturesWithId = (features) => features.filter(({ properties }) => properties.id);

let filteredFeatures = [];

map.on('load', function () {
  // Force resize the make the map fullscreen
  window.dispatchEvent(new Event('resize'));

  addSourceToMap();
  addLayersToMap();

  const { lastSelectedMode, featureCollection: { features } } = applicationMap;

  // The only features that are needed are the ones who has an ID in its properties
  filteredFeatures = getFeaturesWithId(features);
  drawApplication(filteredFeatures, lastSelectedMode);
});


document.querySelectorAll('input[type=radio]').forEach(radio => {
  radio.addEventListener('change', function ({ target }) {
    drawApplication(filteredFeatures, target.value);
  });
});