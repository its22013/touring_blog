"use client";

import React, { useState, useEffect } from 'react';
import style from './AdditionalOptions.module.css';

interface AdditionalOptionsProps {
  onOptionsChange: (options: { 
    priceRange: string; 
    starRating: string; 
    amenities: string[]; 
    numberOfGuests: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
  }) => void;
}

const AdditionalOptions: React.FC<AdditionalOptionsProps> = ({ onOptionsChange }) => {
  const [priceRange, setPriceRange] = useState<string>('');
  const [starRating, setStarRating] = useState<string>('1 星');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [numberOfGuests, setNumberOfGuests] = useState<string>('1');
  const [roomType, setRoomType] = useState<string>('シングル');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');

  useEffect(() => {
    onOptionsChange({ 
      priceRange, 
      starRating, 
      amenities, 
      numberOfGuests,
      roomType,
      checkInDate,
      checkOutDate
    });
  }, [priceRange, starRating, amenities, numberOfGuests, roomType, checkInDate, checkOutDate]);

  const handleAmenityChange = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className={style.options_container}>
      <h3 className={style.options_title}>詳細設定</h3>
      <label className={style.option_label}>
        価格範囲:
        <input 
          type="text" 
          placeholder="例: ¥5000 - ¥10000"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
        />
      </label>
      <label className={style.option_label}>
        星の数:
        <select
          value={starRating}
          onChange={(e) => setStarRating(e.target.value)}
        >
          <option>1 星</option>
          <option>2 星</option>
          <option>3 星</option>
          <option>4 星</option>
          <option>5 星</option>
        </select>
      </label>
      <label className={style.option_label}>
        アメニティ:
        <input 
          type="checkbox" 
          checked={amenities.includes('無料 Wi-Fi')}
          onChange={() => handleAmenityChange('無料 Wi-Fi')}
        /> 無料 Wi-Fi
        <input 
          type="checkbox" 
          checked={amenities.includes('朝食付き')}
          onChange={() => handleAmenityChange('朝食付き')}
        /> 朝食付き
        <input 
          type="checkbox" 
          checked={amenities.includes('駐車場')}
          onChange={() => handleAmenityChange('駐車場')}
        /> 駐車場
        <input 
          type="checkbox" 
          checked={amenities.includes('プール')}
          onChange={() => handleAmenityChange('プール')}
        /> プール
        <input 
          type="checkbox" 
          checked={amenities.includes('ジム')}
          onChange={() => handleAmenityChange('ジム')}
        /> ジム
      </label>
      <label className={style.option_label}>
        宿泊人数:
        <input 
          type="number" 
          min="1" 
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(e.target.value)}
        />
      </label>
      <label className={style.option_label}>
        部屋タイプ:
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option>シングル</option>
          <option>ダブル</option>
          <option>ツイン</option>
          <option>スイート</option>
        </select>
      </label>
      <label className={style.option_label}>
        チェックイン日:
        <input 
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
        />
      </label>
      <label className={style.option_label}>
        チェックアウト日:
        <input 
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
        />
      </label>
    </div>
  );
};

export default AdditionalOptions;