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

export default function MapView({ messengers, locations = [], selectedMessengerId }) {
    // Default center (Bogotá)
    const defaultCenter = [4.6482, -74.0601];

    const selectedMessenger = messengers.find(m => m.id === selectedMessengerId);
    const center = selectedMessenger?.lat ? [selectedMessenger.lat, selectedMessenger.lng] : defaultCenter;

    // Sede Icon (Pharma style)
    const SedeIcon = L.divIcon({
        html: `<div class="bg-indigo-600 p-2 rounded-full border-2 border-white shadow-lg text-white dark:invert dark:hue-rotate-180"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    // Function to get icon color based on class
    const getIconColorClass = (className) => {
        switch (className) {
            case 'status-en-ruta': return 'bg-red-500 text-white border-red-200';
            case 'status-almuerzo': return 'bg-amber-400 text-white border-amber-200';
            case 'status-libre': return 'bg-emerald-500 text-white border-emerald-200';
            default: return 'bg-slate-400 text-white border-slate-200';
        }
    };

    // Helper to generate dynamic messenger icon
    const createMessengerIcon = (className) => {
        const colorClasses = getIconColorClass(className);
        return L.divIcon({
            html: `<div class="relative w-8 h-8 flex items-center justify-center rounded-full border-2 shadow-md ${colorClasses} transform transition-transform hover:scale-110 dark:invert dark:hue-rotate-180">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${className === 'status-en-ruta' ? 'bg-red-500' : className === 'status-almuerzo' ? 'bg-amber-400' : 'bg-emerald-500'}"></div>
            </div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16] // Center anchor
        });
    };

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative z-0 dark:invert dark:hue-rotate-180">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={selectedMessenger?.lat ? [selectedMessenger.lat, selectedMessenger.lng] : null} zoom={15} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Sedes Markers */}
                {locations.filter(l => l.lat).map(l => (
                    <Marker
                        key={`sede-${l.id}`}
                        position={[l.lat, l.lng]}
                        icon={SedeIcon}
                    >
                        <Popup>
                            <div className="text-center p-1 dark:invert dark:hue-rotate-180">
                                <h4 className="font-bold text-sm">{l.name}</h4>
                                <p className="text-[10px] text-slate-500 mt-1">{l.address}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Messengers Markers */}
                {messengers.filter(m => m.lat).map(m => (
                    <Marker
                        key={m.id}
                        position={[m.lat, m.lng]}
                        icon={createMessengerIcon(m.class_name)}
                        eventHandlers={{
                            click: () => {
                                // Potentially trigger a callback to highlight in list
                            },
                        }}
                    >
                        <Popup>
                            <div className="text-center p-1 dark:invert dark:hue-rotate-180">
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
