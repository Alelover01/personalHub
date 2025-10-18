import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function WorldMap() {
    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }} >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[41.9028, 12.4964]}>
                <Popup>Roma IT</Popup>
            </Marker>
        </MapContainer>
    );
}
export default WorldMap;