/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiemVpcnJvdyIsImEiOiJjbHh0Ym03eHkwMms3MmtzY2s4Zzg0azVpIn0.U7Z5S0M6B4GRpB7YpLmG2w';

const map = new mapboxgl.Map({
  container:'map',
  style:'mapbox://styles/mapbox/streets-v11',
  // center: [locations[0].lng, locations[0].lat],
  // zoom: 10
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location => {
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  }).setLngLat(location.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    .setHTML(`<h3>${location.description}</h3><p>Day ${location.day}</p>`))
    .addTo(map);

    bounds.extend(location.coordinates);
});

map.fitBounds(bounds);