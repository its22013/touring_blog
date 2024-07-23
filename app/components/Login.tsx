'use client';

import React from 'react';
import { auth, provider } from '../hooks/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css'; 

const Login: React.FC = () => {
  const router = useRouter(); 

  const handleLogin = async () => {
    console.log("ログインボタンをクリック");
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("ログイン成功！");
      const user = result.user;
      console.log('ユーザー情報:', user);
      
      // ログイン成功後に実行案内ページに遷移する
      router.push(`/BlogIndex`);

    } catch (error) {
      console.error('ログインに失敗しました', error);
    }
  };

  return (
    <div className={styles.parent}>
    <div className={styles.container}>
      <h1 className={styles.title}>ログイン</h1>
      <button className={styles.loginButton} onClick={handleLogin}>Googleで続行</button>
    </div>
    </div>
  );
};

export default Login;