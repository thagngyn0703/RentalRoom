import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import CSS
import 'leaflet/dist/leaflet.css';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon paths for leaflet in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});



function RecenterAutomatically({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.setView([center.lat, center.lng], zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

const LeafletMap = ({ center = { lat: 10.77653, lng: 106.70098 }, zoom = 17, initialMarker }) => {
  const [marker, setMarker] = useState(initialMarker || null);

  useEffect(() => {
    setMarker(initialMarker || null);
  }, [initialMarker]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      dragging={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterAutomatically center={center} zoom={zoom} />
      {marker && (
        <Marker position={[marker.lat, marker.lng]}>
          <Popup>{marker.address || `${marker.lat}, ${marker.lng}`}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LeafletMap;
