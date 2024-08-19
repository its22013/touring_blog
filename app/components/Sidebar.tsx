"use client";

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FaHotel, FaChrome, FaBars } from "react-icons/fa6";
import { GiCharm } from "react-icons/gi";
import { IoAddCircleSharp } from "react-icons/io5";
import styles from '../styles/Sidebar.module.css';
import { auth } from '../hooks/firebaseConfig';
import { FaHome } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const [userName, setUserName] = useState<string>('ユーザー');
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activePath, setActivePath] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();

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

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('User signed out');
      router.push('/');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setActivePath(window.location.pathname);
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 844;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setIsSidebarOpen(true); // Web画面ではサイドバーを常に表示
      } else {
        setIsSidebarOpen(false); // モバイル画面ではデフォルトで非表示
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {isMobile && (
        <div className={styles.hamburger} onClick={toggleSidebar}>
          <FaBars />
        </div>
      )}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.currentDateTime}>{currentDateTime}</div>
        
        {userPhotoURL && <img src={userPhotoURL} alt="ユーザーアイコン" className={styles.userIcon} />}
        <div onClick={() => router.push('/MyArticle')}>
          <h1 className={styles.name}>{userName}</h1>
        </div>

        <div className={`${styles.favorite} ${activePath === '/BlogIndex' ? styles.active : ''}`} onClick={() => router.push('/BlogIndex')}>
          <FaHome className={styles.favoriteIcon} />
          <span><h2 className={styles.text}>Home</h2></span>
        </div>

        <div className={`${styles.favorite} ${activePath === '/BookMark' ? styles.active : ''}`} onClick={() => router.push('/BookMark')}>
          <GiCharm className={styles.favoriteIcon} />
          <span><h2 className={styles.text}>Book Mark</h2></span>       
        </div>
      
        <div className={`${styles.favorite} ${activePath === '/CreateArticle' ? styles.active : ''}`} onClick={() => router.push('/CreateArticle')}>
          <IoAddCircleSharp className={styles.favoriteIcon}/>
          <h2 className={styles.text}>Create article</h2>
        </div>

        <div className={`${styles.favorite} ${['/SearchHotel', '/SearchHotel/Results_Hotel'].includes(activePath) ? styles.active : ''}`} onClick={() => router.push('/SearchHotel')}>
          <FaHotel className={styles.favoriteIcon} />
          <span><h2 className={styles.text}>Search Hotel</h2></span>
        </div>

        {!isLoggedIn ? (
          <button onClick={handleLoginRedirect} className={styles.loginButton}>ログイン</button>
        ) : (
          <button onClick={handleLogout} className={styles.logoutButton}>ログアウト</button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;