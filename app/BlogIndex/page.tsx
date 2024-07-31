"use client";

import React, { useState, useEffect } from 'react';
import styles from '../styles/Blogindex.module.css';
import Sidebar from '../components/Sidebar';
import { db } from '../hooks/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Schedule: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const q = query(collection(db, `users/${currentUser.uid}/articles`));
          const querySnapshot = await getDocs(q);
          const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPosts(postsData);
        } catch (error) {
          console.error("データの取得に失敗しました:", error);
          setError("データの取得に失敗しました。");
        }
        setLoading(false);
      } else {
        setUser(null);
        setError("ログインしていません。");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // クリーンアップ
  }, [auth]);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.post}>投稿記事一覧</h1>
        {loading ? (
          <p>読み込み中...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.postsContainer}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.postContent}>{post.content}</p>
                  <p className={styles.postDate}>投稿日: {new Date(post.created_at).toLocaleDateString()}</p>
                  {post.image && <img src={post.image} alt="投稿画像" className={styles.postImage} />}
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.postLink}>関連リンク</a>
                  {post.lat && post.lng && (
                    <div className={styles.mapContainer}>
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?q=${post.lat},${post.lng}&key=AIzaSyAKxDni4l7pNMomV5s_j2qbBVfsn2dyqBA`}
                        width="300"
                        height="150"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.noPosts}>投稿がありません。</p>
            )}
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  );
};

export default Schedule;
