"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../hooks/firebaseConfig'; 
import Sidebar from '../components/Sidebar';
import styles from '../styles/List.module.css';
import { FaHeart } from 'react-icons/fa'; 
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

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [user, setUser] = useState<any>(null); // ユーザーの状態
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // お気に入り記事のIDを保持するセット
  const [notification, setNotification] = useState<string | null>(null); // 通知メッセージの状態

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(db, 'articles');
        const articlesQuery = query(articlesCollection, orderBy('created_at', 'desc'));
        const articlesSnapshot = await getDocs(articlesQuery);
        
        const articlesList = articlesSnapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data() as Omit<Article, 'id'>
        }));
        
        setArticles(articlesList);
      } catch (error) {
        console.error('記事の取得に失敗しました: ', error);
      }
    };

    const fetchUser = async () => {
      const auth = getAuth(); // Firebase Authentication インスタンスを取得
      onAuthStateChanged(auth, (currentUser: User | null) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      });
    };

    const fetchFavorites = async () => {
      if (user) {
        try {
          const favoritesDocRef = doc(db, `users/${user.uid}/favorites`, 'list');
          const favoritesSnapshot = await getDoc(favoritesDocRef);

          if (!favoritesSnapshot.exists()) {
            await setDoc(favoritesDocRef, { articleIds: [] });
          } else {
            setFavorites(new Set(favoritesSnapshot.data()?.articleIds || []));
          }
        } catch (error) {
          console.error('お気に入りの取得に失敗しました: ', error);
        }
      }
    };

    fetchUser().then(() => {
      fetchArticles();
      fetchFavorites();
    });
  }, [user]);

  const handleFavoriteToggle = async (articleId: string) => {
    if (user) {
      try {
        const favoritesDocRef = doc(db, `users/${user.uid}/favorites`, 'list');
        const isFavorite = favorites.has(articleId);

        if (isFavorite) {
          await updateDoc(favoritesDocRef, {
            articleIds: arrayRemove(articleId)
          });
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(articleId);
            return newSet;
          });
          alert('お気に入りから削除しました。');
        } else {
          await updateDoc(favoritesDocRef, {
            articleIds: arrayUnion(articleId)
          });
          setFavorites(prev => new Set(prev).add(articleId));
          alert('お気に入りに追加しました。');
        }
      } catch (error) {
        console.error('お気に入りの更新に失敗しました: ', error);
      }
    }
  };

  return (
    <div>
      <Sidebar />
      <div className={styles.container}>
        <h1 className={styles.title}>投稿記事一覧</h1>
        {notification && <div className={styles.notification}>{notification}</div>}
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
                <button 
                  className={styles.favoriteButton} 
                  onClick={() => handleFavoriteToggle(article.id)}
                  aria-label={favorites.has(article.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(article.id) ? 
                    <FaHeart className={styles.favoriteIcon01} /> : 
                    <FaHeart className={styles.favoriteIcon02} />
                  }
                </button>
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
