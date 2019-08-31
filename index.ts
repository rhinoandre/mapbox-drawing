import { isZoned } from './helper';
import { map, addSourceToMap, updateSourceMap, SOURCE_MAP_ID } from './mapbox';
import { addLayersToMap } from './layer';
import drawApplication from './draw';
import applicationMap from './applicationMap';

import './style.css';

const getFeaturesWithId = (features) => features.filter(({ properties }) => properties.id);

let filteredFeatures = [];

map.on('load', function () {
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