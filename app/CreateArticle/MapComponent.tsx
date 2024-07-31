"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import styles from './MapComponent.module.css'; // CSSモジュールのインポート

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const customIcon = new L.Icon({
    iconUrl: '/images/marker-shadow.png', 
    iconSize: [80, 50],
    iconAnchor: [38, 32],
    popupAnchor: [0, -32] 
});

interface MapComponentProps {
    location: { lat: number; lng: number };
    setLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
}

const LocationMarker: React.FC<{ setLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>, setAddress: React.Dispatch<React.SetStateAction<string>> }> = ({ setLocation, setAddress }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setLocation({ lat, lng });

            fetch(`${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lng}&format=json`)
                .then(response => response.json())
                .then(data => {
                    if (data.address) {
                        const address = `${data.address.road || ''} ${data.address.city || ''} ${data.address.country || ''}`;
                        setAddress(address);
                    } else {
                        setAddress('住所が見つかりませんでした');
                    }
                })
                .catch(error => {
                    console.error('住所検索エラー:', error);
                    setAddress('住所検索エラー');
                });

            map.setView([lat, lng], map.getZoom() + 2);
        }
    });
    return null;
};

const MapUpdater: React.FC<{ location: { lat: number; lng: number } }> = ({ location }) => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            map.setView([location.lat, location.lng], map.getZoom());
        }
    }, [location, map]);

    return (
        <Marker position={location} icon={customIcon}>
            <Popup>
                {'現在の位置'}
            </Popup>
        </Marker>
    );
};

const MapComponent: React.FC<MapComponentProps> = ({ location, setLocation, setAddress }) => {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // 現在地を取得する
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                setLocation({ lat: latitude, lng: longitude });
            },
            (error) => {
                console.error('現在地取得エラー:', error);
                // 現在地取得に失敗した場合の処理
            }
        );
    }, [setLocation]);

    if (!currentLocation) {
        return <div>現在地を取得しています...</div>;
    }

    return (
        <div className={styles.container}>
            <MapContainer 
                center={currentLocation} 
                zoom={13} 
                style={{ height: "400px", width: "100%" }}
                className={styles.map}
            >
                <LayersControl>
                    <LayersControl.BaseLayer name="OpenStreetMap" checked>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Aerial Imagery">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>
                <LocationMarker setLocation={setLocation} setAddress={setAddress} />
                <MapUpdater location={currentLocation} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;