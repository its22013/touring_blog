"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../hooks/firebaseConfig'; 
import Sidebar from '../components/Sidebar';
import styles from '../styles/List.module.css';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

interface Article {
  id: string; 
  title: string;
  content: string;
  tags: string[];
  created_at: { seconds: number };
  image: string;
  userName: string;
  userPhotoURL: string;
}

const Favorites: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [user, setUser] = useState<any>(null); // ユーザーの状態

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth(); // Firebase Authentication インスタンスを取得
      onAuthStateChanged(auth, async (currentUser: User | null) => {
        if (currentUser) {
          setUser(currentUser);
          
          // ユーザーのお気に入り記事を取得
          const favoritesDocRef = doc(db, `users/${currentUser.uid}/favorites`, 'list');
          const favoritesSnapshot = await getDoc(favoritesDocRef);

          if (favoritesSnapshot.exists()) {
            const favoriteIds = favoritesSnapshot.data()?.articleIds || [];

            // お気に入りの記事を取得
            const articlesQuery = query(collection(db, 'articles'), where('__name__', 'in', favoriteIds));
            const articlesSnapshot = await getDocs(articlesQuery);

            const articlesList = articlesSnapshot.docs.map(doc => ({
              id: doc.id, 
              ...doc.data() as Omit<Article, 'id'>
            }));
            
            setArticles(articlesList);
          }
        } else {
          setUser(null);
        }
      });
    };

    fetchUser();
  }, []);

  return (
    <div>
      <Sidebar />
      <div className={styles.container}>
        <h1 className={styles.title}>お気に入りの記事一覧</h1>
        <section>
          {articles.length > 0 ? (
            articles.map((article) => (
              <article key={article.id} className={styles.post}>
                <div className={styles.box01}>
                  <img src={article.image} className={styles.image} alt="記事画像"/>
                  <div className={styles.iconnemeset}>
                    <img 
                      src={article.userPhotoURL || '/images/default-icon.png'} 
                      alt="ユーザーアイコン" 
                      className={styles.icon} 
                    />
                    <div className={styles.sub_box}>
                      <p className={styles.username}>{article.userName}</p>
                      <h2 className={styles.posttitle}>
                        <a href={`/articles/${article.id}`}>{article.title}</a>
                      </h2>
                      <div className={styles.tagsList}>
                        {article.tags.map((tag: string, index: number) => (
                          <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </div> 
                  </div>
                </div>
                <strong className={styles.postdate}>投稿日: {new Date(article.created_at.seconds * 1000).toLocaleDateString()}</strong>
              </article>
            ))
          ) : (
            <p>お気に入りの記事がありません。</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Favorites;