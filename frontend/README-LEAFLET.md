Leaflet integration (local notes)
=================================

This project was extended to use Leaflet + OpenStreetMap for selecting map locations without requiring a Google API key.

Install dependencies (from frontend folder):

With yarn:
  yarn add react-leaflet leaflet

With npm:
  npm install react-leaflet leaflet

Usage notes:
- The component `src/Components/Map/LeafletMap.jsx` provides a map that accepts an `onSelect` callback.
- Clicking the map will attempt a reverse-geocode via Nominatim (OpenStreetMap). Nominatim has rate limits for heavy usage; for production consider using a paid geocoding provider or self-hosting.
- The `selectLocation.jsx` component was updated to render the map and store `mapLat`, `mapLng`, and `mapAddress` into the shared `nameLocation` state when the user clicks the map.

Testing:
1. From the `frontend` folder run `yarn start` or `npm start`.
2. Open the Invite/Submit page, fill the address selectors and click "Xác nhận" to show the map placeholder, then click on the map to place a marker and capture coordinates.
