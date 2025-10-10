// Code splitting simplifié - désactivé temporairement
export const preloadStrategies = {
  home: () => {},
  map: () => {},
  settings: () => {}
};

export const routeChunks = {
  home: ['home-page'],
  map: ['map-page'],
  audioGuides: ['audio-guides-page'],
  monitoring: ['monitoring-dashboard']
};

export const getBundleInfo = () => {
  return {
    totalChunks: Object.keys(routeChunks).length,
    loadedChunks: [],
    pendingChunks: []
  };
};

export default {
  preloadStrategies,
  routeChunks,
  getBundleInfo
};