import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map on selection
function ChangeView({ center, zoom }) {
    const map = useMap();
    if (center) {
        map.flyTo(center, zoom, {
            duration: 1.5
        });
    }
    return null;
}

export default function MapView({ messengers, selectedMessengerId }) {
    // Default center (Bogotá)
    const defaultCenter = [4.6482, -74.0601];

    const selectedMessenger = messengers.find(m => m.id === selectedMessengerId);
    const center = selectedMessenger?.lat ? [selectedMessenger.lat, selectedMessenger.lng] : defaultCenter;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative z-0">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={selectedMessenger?.lat ? [selectedMessenger.lat, selectedMessenger.lng] : null} zoom={15} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {messengers.filter(m => m.lat).map(m => (
                    <Marker
                        key={m.id}
                        position={[m.lat, m.lng]}
                        eventHandlers={{
                            click: () => {
                                // Potentially trigger a callback to highlight in list
                            },
                        }}
                    >
                        <Popup>
                            <div className="text-center p-1">
                                <h4 className="font-bold text-sm mb-1">{m.name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-white ${m.class_name === 'status-en-ruta' ? 'bg-red-500' :
                                    m.class_name === 'status-almuerzo' ? 'bg-amber-400' : 'bg-emerald-500'
                                    }`}>
                                    {m.status}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-2 font-mono">{m.vehicle}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
