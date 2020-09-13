/* eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWtndXB0YS00NyIsImEiOiJja2VoMWFscjIxNWZnMnluN2I2bDRuaDlxIn0.ah4L0PiGODvUsCtY9fmfpA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/akgupta-47/ckehen5sc10s91ajyclffdz75',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(
        `<p>
        Day ${loc.day}: ${loc.description}
      </p>`
      )
      .addTo(map);
    // include map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
