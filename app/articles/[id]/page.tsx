"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/app/hooks/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/DetailedArticle.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Sidebar from '@/app/components/Sidebar';
import Breadcrumbs from '@/app/components/Breadcrumbs';

const DetailedArticle: React.FC = () => {
    const { id } = useParams();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            if (id) {
                try {
                    let docRef = doc(db, `articles/${id}`);
                    let docSnap = await getDoc(docRef);

                    if (!docSnap.exists() && user) {
                        docRef = doc(db, `users/${user.uid}/articles/${id}`);
                        docSnap = await getDoc(docRef);
                    }

                    if (docSnap.exists()) {
                        setArticle(docSnap.data());
                    } else {
                        setError("記事が見つかりませんでした。");
                    }
                } catch (error) {
                    console.error("記事の取得中にエラーが発生しました:", error);
                    setError("記事の取得中にエラーが発生しました。");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchArticle();
    }, [id, user]);

    return (
        <div className={styles.pageContainer}>
            <Breadcrumbs currentPage={article?.title} />
            <div className={styles.content}>
                {loading ? (
                    <p className={styles.loading}>読み込み中...</p>
                ) : article ? (
                    <>
                        <h1 className={styles.title}>{article.title}</h1>
                        {article.image && <img src={article.image} alt="Article Image" className={styles.image} />}
                        <p>{article.content}</p>
                        <p>投稿日: {new Date(article.created_at).toLocaleDateString()}</p>
                        <div className={styles.tags}>
                            {article.tags && article.tags.map((tag: string, index: number) => (
                                <span key={index} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                        <div className={styles.url}>
                            {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer">関連URL</a>}
                        </div>
                    </>
                ) : (
                    <p className={styles.error}>{error}</p>
                )}
            </div>
            <Sidebar />
        </div>
    );
};

export default DetailedArticle;
