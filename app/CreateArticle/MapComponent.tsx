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

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

const LocationMarker: React.FC<{ marker: Location | null, setMarker: React.Dispatch<React.SetStateAction<Location | null>> }> = ({ marker, setMarker }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;

            fetch(`${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lng}&format=json`)
                .then(response => response.json())
                .then(data => {
                    let address = '住所が見つかりませんでした';
                    if (data.address) {
                        address = `${data.address.road || ''} ${data.address.city || ''} ${data.address.country || ''}`;
                    }

                    // Update the single marker's location and address
                    setMarker({ lat, lng, address });

                    map.setView([lat, lng], map.getZoom() + 2);
                })
                .catch(error => {
                    console.error('住所検索エラー:', error);
                    // Update the marker with an error message
                    setMarker({ lat, lng, address: '住所検索エラー' });
                });
        }
    });

    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ location, setLocation, setAddress }) => {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [marker, setMarker] = useState<Location | null>(null);

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

    useEffect(() => {
        if (currentLocation) {
            setMarker({ ...currentLocation, address: '現在地' });
        }
    }, [currentLocation]);

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
                <LocationMarker marker={marker} setMarker={setMarker} />
                {marker && (
                    <Marker position={{ lat: marker.lat, lng: marker.lng }} icon={customIcon}>
                        <Popup>
                            {marker.address || '現在の位置'}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;