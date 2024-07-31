"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import styles from './MapComponent.module.css'; // CSSモジュールのインポート

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
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
}

const LocationMarker = ({ setLocation, setAddress }: { setLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>, setAddress: React.Dispatch<React.SetStateAction<string>> }) => {
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

const MapUpdater: React.FC<{ location: { lat: number; lng: number }, address: string }> = ({ location, address }) => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            map.setView([location.lat, location.lng], map.getZoom());
        }
    }, [location, map]);

    return (
        <Marker position={location} icon={customIcon}>
            <Popup>
                {address || '現在の位置'}
            </Popup>
        </Marker>
    );
};

const MapComponent: React.FC<MapComponentProps> = ({ location, setLocation }) => {
    const [searchAddress, setSearchAddress] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchAddress.trim()) {
            alert("検索する住所を入力してください")

            return;
        }

        setError(null); // エラーをリセット

        try {
            const response = await fetch(`${NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(searchAddress)}&format=json`);
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newLatLng = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setLocation(newLatLng);
                setAddress(display_name);
            } else {
                setError('住所が見つかりませんでした');
                setAddress(''); // 結果が見つからなかった場合、アドレスもリセット
            }
        } catch (error) {
            console.error('住所検索エラー:', error);
            setError('住所検索中にエラーが発生しました');
            setAddress(''); // エラー発生時もアドレスをリセット
        }
    };

    return (
        <div className={styles.container}>
            <MapContainer 
                center={location} 
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
                <MapUpdater location={location} address={address} />
            </MapContainer>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="住所を検索"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    className={styles.searchInput}
                />
                <button onClick={handleSearch} className={styles.searchButton}>検索</button>
            </div>
        </div>
    );
};

export default MapComponent;