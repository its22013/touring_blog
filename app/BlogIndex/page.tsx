"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../hooks/firebaseConfig';
import styles from '../styles/Blogindex.module.css';
import Sidebar from '../components/Sidebar';

interface Article {
  id: string;
  title: string;
  content: string;
  user: {
    displayName: string;
  };
  createdAt: { seconds: number };
}

const Schedule: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesRef = collection(db, 'users');
        const userDocs = await getDocs(articlesRef);

        const articlesData: Article[] = [];

        for (const userDoc of userDocs.docs) {
          const userId = userDoc.id;
          const articlesCollection = collection(db, 'users', userId, 'articles');
          const q = query(articlesCollection); // Adjust query if needed
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            articlesData.push({
              id: doc.id,
              ...doc.data(),
            } as Article);
          });
        }

        setArticles(articlesData);
      } catch (error) {
        console.error('Error fetching articles: ', error);
        setError('記事はありません！');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.post}>投稿記事一覧</h1>
        {loading ? (
          <p>読み込み中...</p>
        ) : error ? (
          <p>{error}</p>
        ) : articles.length === 0 ? (
          <p>記事がありません。</p>
        ) : (
          <ul className={styles.articleList}>
            {articles.map((article) => (
              <li key={article.id} className={styles.article}>
                <div className={styles.articleContent}>
                  <h2>{article.title}</h2>
                  <p>{article.content}</p>
                  <small>投稿日時: {new Date(article.createdAt.seconds * 1000).toLocaleDateString()}</small>
                </div>
                <div className={styles.articleUser}>
                  <p>投稿者: {article.user.displayName}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Sidebar />
    </div>
  );
};

export default Schedule;