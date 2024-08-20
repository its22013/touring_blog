"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import styles from '../styles/MyArticle.module.css';
import { db } from '../hooks/firebaseConfig';
import { collection, query, getDocs, doc, deleteDoc, orderBy, where, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { MdDelete } from "react-icons/md";
import Breadcrumbs from '../components/Breadcrumbs';

const MyProfile: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                setLoading(false); // ユーザーがいない場合は読み込み完了とする
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            if (user) {
                try {
                    const userId = user.uid;
                    const articlesCollection = collection(db, `users/${userId}/articles`);
                    const q = query(articlesCollection, orderBy('created_at', 'desc'));
                    const querySnapshot = await getDocs(q);

                    const articlesData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setArticles(articlesData);
                } catch (error) {
                    console.error("記事の取得中にエラーが発生しました:", error);
                    setError("記事の取得中にエラーが発生しました。");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchArticles();
    }, [user]);

    const handleDelete = async (articleId: string) => {
        if (user) {
            try {
                const userId = user.uid;
                const articleDocRef = doc(db, `users/${userId}/articles`, articleId);

                // 記事を削除する前に created_at を取得
                const articleSnapshot = await getDoc(articleDocRef);
                const { created_at } = articleSnapshot.data() || {};

                // 並行して2つのドキュメントを削除
                await Promise.all([
                    deleteDoc(articleDocRef),
                    deleteMatchingArticles(created_at) // created_at が一致する記事を削除
                ]);

                // 削除後に記事を再取得
                const updatedArticles = articles.filter(article => article.id !== articleId);
                setArticles(updatedArticles);
            } catch (error) {
                console.error("記事の削除中にエラーが発生しました:", error);
                setError("記事の削除中にエラーが発生しました。");
            }
        }
    };

    // created_at が一致する記事を削除する関数
    const deleteMatchingArticles = async (createdAt: any) => {
        if (!createdAt) return;
        const articlesCollection = collection(db, 'articles');
        const q = query(articlesCollection, where('created_at', '==', createdAt));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    };

    // 投稿日の表示の処理
    const formatDate = (timestamp: any) => {
        if (timestamp && timestamp.toDate) {
            return new Date(timestamp.toDate()).toLocaleDateString();
        }
        return '';
    };

    return (
        <div>
            <div className={styles.breadcrumbs}>
                <Breadcrumbs currentPage="投稿した記事" />
            </div>
            <div className={styles.container}>
                <h1 className={styles.title}>投稿した記事</h1>
                {loading ? (
                    <p className={styles.loading}>読み込み中...</p>
                ) : error ? (
                    <p className={styles.error}>{error}</p>
                ) : user ? (
                    articles.length > 0 ? (
                        <ul className={styles.articleList}>
                            {articles.map((article) => (
                                <li key={article.id} className={styles.articleItem}>
                                    {/* 写真 */}
                                    {article.image ? (
                                        <img src={article.image} alt="Article Image" className={styles.articleImage} />
                                    ) : (
                                        <img src="/images/noimages.png" alt="No Image Available" className={styles.articleImage} />
                                    )}

                                    <div className={styles.subcontainer}>
                                        {/* タイトル */}
                                        <h2 className={styles.articleTitle}><a href={`/articles/${article.id}`}>{article.title}</a></h2>

                                        {/* 投稿日 */}
                                        <p className={styles.date}>投稿日: {formatDate(article.created_at)}</p>
                                        
                                        {/* タグ */}
                                        <div className={styles.tagsList}>
                                            {article.tags && article.tags.map((tag: string, index: number) => (
                                                <span key={index} className={styles.tag}>{tag}</span>
                                            ))}
                                        </div>

                                        {/* 関連URL */}
                                        {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.url}>関連URL</a>}
                                    </div>

                                    {/* 削除アイコン */}
                                    <div>
                                        <MdDelete className={styles.delete_icons} onClick={() => handleDelete(article.id)} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>
                            <p className={styles.post_not}>投稿がありません。</p>
                            <div onClick={() => router.push('/CreateArticle')}>
                                <h2 className={styles.post_not01}>投稿記事を作成しますか？</h2>
                            </div>
                        </div>
                    )
                ) : (
                    <p className={styles.post_not01}>ログインしていないため、記事を表示できません。</p>
                )}
            </div>
            <Sidebar />
        </div>
    );
};

export default MyProfile;