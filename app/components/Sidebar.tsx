// components/Sidebar.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { MdNotifications } from 'react-icons/md'; 
import { GiCharm } from "react-icons/gi";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { auth } from '../hooks/firebaseConfig';

const Sidebar: React.FC = () => {
  const [userName, setUserName] = useState<string>('ユーザー');
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [activePath] = useState<string>('');

  // ログインした後の情報を取得して表示する処理
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'ユーザー');
        setUserPhotoURL(user.photoURL);
      } else {
        setUserName('ユーザー');
        setUserPhotoURL(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 現時刻の表示するための処理
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

  // ログアウトの処理
  const router = useRouter();
  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('User signed out');
      router.push('/');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };


  return (
    <aside className={styles.sidebar}>
      {/* 現時刻の表示 */}
      <div className={styles.currentDateTime}>{currentDateTime}</div>
      
      {userPhotoURL && <img src={userPhotoURL} alt="ユーザーアイコン" className={styles.userIcon} />}
      <h1 className={styles.name}>{userName}</h1>

      {/* ホームを表示 */}
      <div className={`${styles.favorite} ${activePath === '/BlogIndex' ? styles.active : ''}`} onClick={() => router.push('/BlogIndex')}>
        <FaHome className={styles.favoriteIcon} />
        <span><h2 className={styles.text}>Home</h2></span>
      </div>

      <div className={`${styles.favorite} ${activePath === '/bookmarks' ? styles.active : ''}`} onClick={() => router.push('/bookmarks')}>
        <GiCharm className={styles.favoriteIcon} />
        <span><h2 className={styles.text}>Book Mark</h2></span>       
      </div>

      {/* 投稿作成を表示 */}
      <div className={`${styles.favorite} ${activePath === '/create-article' ? styles.active : ''}`} onClick={() => router.push('/create-article')}>
        <IoAddCircleSharp className={styles.favoriteIcon}/>
        <h2 className={styles.text}>Create article</h2>
      </div>

      {/* 通知を表示 */}
      <div className={`${styles.favorite} ${activePath === '/notifications' ? styles.active : ''}`} onClick={() => router.push('/notifications')}>
        <MdNotifications className={styles.favoriteIcon} />
        <span><h2 className={styles.text}>Notification</h2></span>
      </div>

      {/* 検索フォーム */}
    

      {/* ログアウトボタン */}
      <button onClick={handleLogout} className={styles.logoutButton}>ログアウト</button>
    </aside>
  );
};

export default Sidebar;