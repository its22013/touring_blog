"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import style from './SearchHotel.module.css';
import AdditionalOptions from './AdditionalOptions';
import { useRouter } from 'next/navigation';

const SearchHotel: React.FC = () => {
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [options, setOptions] = useState<{ priceRange: string; starRating: string; amenities: string[] } | null>(null);

  const router = useRouter();

  const fetchCoordinates = async (address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      throw new Error('座標が取得できませんでした');
    } catch (error) {
      console.error('座標取得エラー:', error);
      throw new Error('座標取得に失敗しました');
    }
  };

  const getCurrentLocation = () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
        (error) => reject(new Error('現在地取得に失敗しました'))
      );
    });
  };

  // 中間地点の緯度経度を計算する関数
  const calculateMidpoint = (startCoords: { lat: number; lon: number }, endCoords: { lat: number; lon: number }) => {
    const midLat = (startCoords.lat + endCoords.lat) / 2;
    const midLon = (startCoords.lon + endCoords.lon) / 2;
    return { lat: midLat, lon: midLon };
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let startCoords;
      let endCoords;

      if (useCurrentLocation) {
        // 現在地利用
        const location = await getCurrentLocation();
        startCoords = location;
        endCoords = location; // 現在地を出発地および目的地として使用
      } else {
        // 指定した場所を利用
        if (startLocation && endLocation) {
          startCoords = await fetchCoordinates(startLocation);
          endCoords = await fetchCoordinates(endLocation);
        } else {
          throw new Error('出発地と目的地を入力してください');
        }
      }

      // 中間地点を計算
      const midpoint = calculateMidpoint(startCoords, endCoords);

      // 中間地点のみを含めたURLを作成
      const queryParams = new URLSearchParams({
        midpointLat: midpoint.lat.toString(),
        midpointLon: midpoint.lon.toString(),
      }).toString();

      router.push(`/SearchHotel/Results_Hotel?${queryParams}`);
    } catch (error) {
      setError('検索フォームに場所を入力してください！');
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      // 中間地点として現在地を使用
      const midpoint = location;
      // 中間地点のみを含めたURLを作成
      const queryParams = new URLSearchParams({
        midpointLat: midpoint.lat.toString(),
        midpointLon: midpoint.lon.toString(),
      }).toString();

      router.push(`/SearchHotel/Results_Hotel?${queryParams}`);
    } catch (error) {
      setError('現在地取得に失敗しました');
      console.error('現在地取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionsChange = (newOptions: { priceRange: string; starRating: string; amenities: string[] }) => {
    setOptions(newOptions);
  };

  return (
    <div className={style.container}>
      <Breadcrumbs currentPage='宿泊施設を検索' />
      <div className={style.subcontainer}>
        <p className={style.title}>宿泊施設を検索</p>
        <div className={style.search_form_conatiner}>
          <div className={style.search_hotel_container}>
            <form onSubmit={handleSearch}>
              <div className={style.button_container}>
                <button
                  type="button"
                  className={style.button}
                  onClick={handleUseCurrentLocation}
                >
                  現在地周辺で検索
                </button>
              </div>

              <div className={style.key_form}>
                <input
                  className={style.form_01}
                  placeholder="出発地を入力"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                />
                <input
                  className={style.form_01}
                  placeholder="目的地を入力"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                />
                <button className={style.button02} type="submit">
                  検索
                </button>
              </div>
            </form>

            {error && <p className={style.error}>{error}</p>}

            <div className={style.options_toggle} onClick={toggleOptions}>
              {showOptions ? '▼ 詳細設定を閉じる' : '▶ 詳細設定を表示'}
            </div>
            {showOptions && <AdditionalOptions onOptionsChange={handleOptionsChange} />}
          </div>

          <div className={style.search_hotel_container}>
            <h2 className={style.text02}>宿泊施設をマップで探す！</h2>
          </div>
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

export default SearchHotel;