// Sidebar.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FaHotel } from "react-icons/fa6";
import { GiCharm } from "react-icons/gi";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { auth } from '../hooks/firebaseConfig';

const Sidebar: React.FC = () => {
  const [userName, setUserName] = useState<string>('ユーザー');
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activePath, setActivePath] = useState<string[]>([]); // 配列に変更
  const router = useRouter();

  // ログイン状態の取得と更新
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'ユーザー');
        setUserPhotoURL(user.photoURL);
        setIsLoggedIn(true);
      } else {
        setUserName('ユーザー');
        setUserPhotoURL(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 現時刻の表示
  useEffect(() => {
    const updateCurrentDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formattedDateTime = now.toLocaleDateString('ja-JP', options);
      setCurrentDateTime(formattedDateTime);
    };

    updateCurrentDateTime();
    const intervalId = setInterval(updateCurrentDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // ログアウト処理
  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('User signed out');
      router.push('/');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  // ログインページへの遷移処理
  const handleLoginRedirect = () => {
    router.push('/login');
  };

  // ページのパスを設定
  useEffect(() => {
    setActivePath([window.location.pathname]); // 配列として設定
  }, [window.location.pathname]);

  return (
    <aside className={styles.sidebar}>
      {/* 現時刻の表示 */}
      <div className={styles.currentDateTime}>{currentDateTime}</div>
      
      {userPhotoURL && <img src={userPhotoURL} alt="ユーザーアイコン" className={styles.userIcon} />}
      <div onClick={() => router.push('/MyArticle')}>
        <h1 className={styles.name}>{userName}</h1>
      </div>

      {/* ホームを表示 */}
      <div className={`${styles.favorite} ${activePath.includes('/BlogIndex') ? styles.active : ''}`} onClick={() => router.push('/BlogIndex')}>
        <FaHome className={styles.favoriteIcon} />
        <span><h2 className={styles.text}>Home</h2></span>
      </div>

      <div className={`${styles.favorite} ${activePath.includes('/bookmarks') ? styles.active : ''}`} onClick={() => router.push('/bookmarks')}>
        <GiCharm className={styles.favoriteIcon} />
        <span><h2 className={styles.text}>Book Mark</h2></span>       
      </div>
    
      {/* 投稿作成を表示 */}
      <div className={`${styles.favorite} ${activePath.includes('/CreateArticle') ? styles.active : ''}`} onClick={() => router.push('/CreateArticle')}>
        <IoAddCircleSharp className={styles.favoriteIcon}/>
        <h2 className={styles.text}>Create article</h2>
      </div>

      {/* 道のりから宿泊施設の検索を表示 */}
      <div className={`${styles.favorite} ${activePath.some(path => ['/SearchHotel', '/SearchHotel/Results_Hotel'].includes(path)) ? styles.active : ''}`} onClick={() => router.push('/SearchHotel')}>
        <FaHotel className={styles.favoriteIcon} />
        <span><h2 className={styles.text}>Search Hotel</h2></span>
      </div>

      {/* ログインしていない場合はログインボタンを表示 */}
      {!isLoggedIn ? (
        <button onClick={handleLoginRedirect} className={styles.loginButton}>ログイン</button>
      ) : (
        <button onClick={handleLogout} className={styles.logoutButton}>ログアウト</button>
      )}
    </aside>
  );
};

export default Sidebar;