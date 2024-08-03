// ArticleForm.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../hooks/firebaseConfig";
import ImageUploader from "./ImageUploader";
import MapComponent from "./MapComponent";
import style from "../styles/CreateArticle.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ArticleForm: React.FC = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
    const [tags, setTags] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleAddTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            setError("ログインしていません");
            return;
        }
        if (!title || !content) {
            setError("タイトルと内容を入力してください");
            return;
        }
        if (!location.lat || !location.lng) {
            setError("マップで位置情報を設定してください");
            return;
        }

        const userId = user.uid;
        try {
            const articleData = {
                title,
                content,
                created_at: new Date().getTime(),
                user: { uid: userId },
                url,
                location,
                image: imageUrl,
                tags 
            };

            await Promise.all([
                addDoc(collection(db, `users/${userId}/articles`), articleData),
                addDoc(collection(db, "articles"), articleData)
            ]);

            setTitle('');
            setContent('');
            setUrl('');
            setImage(null);
            setLocation({ lat: 35.6895, lng: 139.6917 });
            setImageUrl(null);
            setTags([]);
            setError(null);
            setMapError(null);
            alert('投稿しました！');
        } catch (error) {
            console.error("データベースに保存する際にエラーが発生しました:", error);
            setError("投稿の保存中にエラーが発生しました。");
        }
    };

    return (
        <main className={style.main}>
            <div className={style.container_wrapper}>
                <div className={style.container}>
                    <h1 className={style.text01}>投稿フォーム</h1>
                    {user ? (
                        <form onSubmit={onSubmit} className={style.form}>
                            <input
                                type="text"
                                value={title}
                                placeholder='タイトル'
                                onChange={(e) => setTitle(e.target.value)}
                                className={style.input}
                            />
                            <input
                                type="text"
                                value={content}
                                placeholder='内容'
                                onChange={(e) => setContent(e.target.value)}
                                className={style.input}
                            />
                            <input
                                type="text"
                                value={url}
                                placeholder='関連するURL'
                                onChange={(e) => setUrl(e.target.value)}
                                className={style.input}
                            />
                            <div className={style.tags}>
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="タグを追加"
                                    className={style.input}
                                />
                                <button type="button" onClick={handleAddTag} className={style.button}>タグ追加</button>
                                <div className={style.tagsList}>
                                    {tags.map((tag, index) => (
                                        <span key={index} className={style.tag}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files && setImage(e.target.files[0])}
                                className={style.input}
                            />
                            <ImageUploader image={image} setImageUrl={setImageUrl} />
                            <MapComponent location={location} setLocation={setLocation} setAddress={() => {}} />
                            <button type='submit' className={style.button}>投稿</button>
                        </form>
                    ) : (
                        <p className={style.error}>ログインしていないため、投稿できません。</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ArticleForm;