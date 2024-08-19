// app/SearchHotel/Results_Hotel/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import style from './HotelResults.module.css';
import Sidebar from '@/app/components/Sidebar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Link from 'next/link';

interface Hotel {
  hotelNo: string;
  hotelName: string;
  hotelImageUrl: string;
  hotelAddress: string;
  hotelMinPrice: string;
  hotelSpecial: string;
  reviewAverage: string;
  reviewCount: string;
  roomInfos: RoomInfo[];
}

interface RoomInfo {
  roomName: string;
  planName: string;
  rakutenCharge: string;
  reserveUrl: string;
}

const HotelResultsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkinDate = '2024-12-01';
  const checkoutDate = '2024-12-02';

  const startLat = parseFloat(searchParams.get('midpointLat') || '26.1959836');
  const startLon = parseFloat(searchParams.get('midpointLon') || '127.6766333');
  const radius = 3.0;

  const RatingStars: React.FC<{ rating: string }> = ({ rating }) => {
    const starCount = Math.round(parseFloat(rating) || 0);
    const stars = Array.from({ length: 5 }, (_, index) => 
      index < starCount ? 'filled' : ''
    );
  
    return (
      <div className={style['star-rating']}>
        {stars.map((filled, index) => (
          <span key={index} className={`${style['star']} ${style[filled]}`}>&#9733;</span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_RAKUTEN_API_KEY;
        if (!apiKey) {
          throw new Error('APIキーが設定されていません');
        }

        const response = await fetch(`https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426?applicationId=${apiKey}&format=xml&datumType=1&checkinDate=${checkinDate}&checkoutDate=${checkoutDate}&latitude=${startLat}&longitude=${startLon}&searchRadius=${radius}`);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTPエラー! ステータス: ${response.status}, メッセージ: ${errorData}`);
        }

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');

        const hotelNodes = xmlDoc.getElementsByTagName('hotel');
        const hotelsArray: Hotel[] = Array.from(hotelNodes).map((node: any) => {
          const hotelInfo = node.getElementsByTagName('hotelBasicInfo')[0];

          const hotelName = hotelInfo.getElementsByTagName('hotelName')[0]?.textContent || '';
          const processedHotelName = isEnglish(hotelName) ? toHalfWidth(hotelName) : hotelName;

          return {
            hotelNo: hotelInfo.getElementsByTagName('hotelNo')[0]?.textContent || '',
            hotelName: processedHotelName,
            hotelImageUrl: hotelInfo.getElementsByTagName('hotelImageUrl')[0]?.textContent || '',
            hotelAddress: `${hotelInfo.getElementsByTagName('address1')[0]?.textContent || ''} ${hotelInfo.getElementsByTagName('address2')[0]?.textContent || ''}`,
            hotelMinPrice: hotelInfo.getElementsByTagName('hotelMinCharge')[0]?.textContent || '',
            hotelSpecial: hotelInfo.getElementsByTagName('hotelSpecial')[0]?.textContent || '',
            reviewAverage: hotelInfo.getElementsByTagName('reviewAverage')[0]?.textContent || '',
            reviewCount: hotelInfo.getElementsByTagName('reviewCount')[0]?.textContent || '',
            roomInfos: Array.from(node.getElementsByTagName('roomInfo')).map((room: any) => ({
              roomName: room.getElementsByTagName('roomName')[0]?.textContent || '',
              planName: room.getElementsByTagName('planName')[0]?.textContent || '',
              rakutenCharge: room.getElementsByTagName('rakutenCharge')[0]?.textContent || '',
              reserveUrl: room.getElementsByTagName('reserveUrl')[0]?.textContent || '',
            }))
          };
        });

        setHotels(hotelsArray);
      } catch (error) {
        setError('データの取得に失敗しました');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    function toHalfWidth(str: string): string {
      return str.replace(/[！-～]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      }).replace(/　/g, ' ');
    }
    
    function isEnglish(text: string): boolean {
      return /^[A-Za-z0-9\s]+$/.test(text);
    }

    fetchHotels();
  }, [checkinDate, checkoutDate, startLat, startLon, radius]);

  return (
    <div className={style.container}>
      <Breadcrumbs currentPage='宿泊施設を検索' currentPage02='宿泊施設の検索結果' />
      <Sidebar />
      <h1 className={style.title}>検索結果</h1>
      {loading ? (
        <p className={style.loading_message}>読み込み中...</p>
      ) : error ? (
        <p className={style.error_message}>{error}</p>
      ) : (
        <div className={style.hotel_list}>
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div key={hotel.hotelNo} className={style.hotel_item}>
                <div className={style.hotel_image_Address}>
                <img src={hotel.hotelImageUrl} alt={hotel.hotelName} className={style.hotelImageUrl} />
                <div className={style.hotel_adress}><Link href={`https://www.google.com/maps/place/${hotel.hotelAddress}`} target="_blank">{hotel.hotelAddress}</Link></div>
                </div>
                <div className={style.hotel_info}>
                  <div className={style.hotel_info_top}>
                    <h2>{hotel.hotelName}</h2>
                    <h3 className={style.hotelMinPrice}>最低価格: ¥{hotel.hotelMinPrice}</h3>
                  </div>     
                  <div className={style.hotel_info_bottom}>
                      <div className={style.reviewAverage_container}>
                      <h3 className={style.reviewAverage}>{parseFloat(hotel.reviewAverage).toFixed(1)}</h3> 
                      <RatingStars rating={hotel.reviewAverage} /> 
                      </div>
                      ({hotel.reviewCount}件のレビュー)
                    
                    <p>特長: {hotel.hotelSpecial}</p>
                    {hotel.roomInfos.length > 0 && (
                      <ul className={style.room_list}>
                        {hotel.roomInfos.map((room, index) => (
                          <li key={index} className={style.room_item}>
                            <h3>{room.roomName}</h3>
                            <p>{room.planName}</p>
                            <p>料金: ¥{room.rakutenCharge}</p>
                            <a href={room.reserveUrl} target="_blank" rel="noopener noreferrer">予約する</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={style.error_message}>ホテル情報が見つかりませんでした。</p>
          )}
        </div>
      )}
    </div>
  );
};

const HotelResultsPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelResultsContent />
    </Suspense>
  );
};

export default HotelResultsPage;