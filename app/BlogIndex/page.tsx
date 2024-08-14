"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../hooks/firebaseConfig'; 
import Sidebar from '../components/Sidebar';
import styles from '../styles/List.module.css';

interface Article {
  title: string;
  content: string;
  created_at: { seconds: number };
  userName: string;
  userPhotoURL: string;
}

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(db, 'articles');
        const articlesSnapshot = await getDocs(articlesCollection);
        const articlesList = articlesSnapshot.docs.map(doc => doc.data() as Article);
        setArticles(articlesList);
      } catch (error) {
        console.error('記事の取得に失敗しました: ', error);
      }
    };
    
    fetchArticles();
  }, []);
  
  return (
    <div>
      <Sidebar />
      <div className={styles.container}>
        <h1 className={styles.title}>投稿記事一覧</h1>
        <section>
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <article key={index} className={styles.post}>
                <div className={styles.iconnemeset}>
                  <img 
                    src={article.userPhotoURL || '/images/default-icon.png'} 
                    alt="ユーザーアイコン" 
                    className={styles.icon} 
                  />
                  <p className={styles.username}>{article.userName}</p>
                </div>
                <h2 className={styles.posttitle}>{article.title}</h2>
                <p className={styles.content}>{article.content}</p>
                <p className={styles.day}>
                  <strong className={styles.postdate}>投稿日:</strong> 
                  {new Date(article.created_at.seconds * 1000).toLocaleDateString()}
                </p>
              </article>
            ))
          ) : (
            <p>記事がありません。</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;