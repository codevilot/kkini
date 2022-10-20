import render from './utils/render.js';
import loadMap from './utils/loadMap.js';

window.addEventListener('popstate', () => {
  console.log('[popstate]', window.location.pathname);
  const [path, params] = window.location.pathname.split('/:');

  render({ path, params });
});
loadMap();
window.addEventListener('DOMContentLoaded', () => {
  const [path, params] = window.location.pathname.split('/:');
  render({ path, params });
});

export default render;
