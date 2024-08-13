import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../hooks/firebaseConfig'; 
import styles from '../styles/CreateArticle.module.css';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const CreateArticleForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (file: File) => {
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user) {
            try {
                const storageRef = ref(storage, `users/${user.uid}/images/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                return url;
            } catch (error) {
                console.error('画像のアップロードに失敗しました: ', error);
                throw new Error('画像のアップロードに失敗しました');
            }
        } else {
            throw new Error('ユーザーがログインしていません');
        }
    };
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null); // エラーをリセット
    
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user) {
            try {
                let uploadedImageUrl = imageUrl;
    
                if (image) {
                    uploadedImageUrl = await handleImageUpload(image);
                }
    
                const articleData = {
                    title,
                    content,
                    image: uploadedImageUrl,
                    created_at: new Date(),
                    userId: user.uid, // userId フィールドを設定
                    tags
                };
    
                console.log('Sending data:', articleData);
    
                // Firestore にデータを追加
                await addDoc(collection(db, 'articles'), articleData);
                await addDoc(collection(db, `users/${user.uid}/articles`), articleData);
    
                alert('記事が投稿されました');
                setTitle('');
                setContent('');
                setImage(null);
                setImageUrl(null);
                setTags([]);
                setNewTag('');
            } catch (error) {
                console.error('記事の投稿に失敗しました: ', error);
                setError('記事の投稿に失敗しました。再試行してください。'); // エラーメッセージを設定
            }
        } else {
            setError('ログインが必要です');
        }
    
        setIsSubmitting(false);
    };            

    const handleAddTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.formHeader}>投稿フォーム</h1>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formField}>
                    <label htmlFor="title">タイトル:</label>
                    <input
                        type="text"
                        id="title"
                        className={styles.inputText}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formField}>
                    <label htmlFor="content">内容:</label>
                    <textarea
                        id="content"
                        className={styles.textarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className={`${styles.formField} ${styles.fileInputWrapper}`}>
                    <label htmlFor="image">画像 (任意):</label>
                    <input
                        type="file"
                        id="image"
                        className={styles.inputFile}
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                    {image && <img src={URL.createObjectURL(image)} alt="プレビュー" className={styles.imagePreview} />}
                </div>
                <div className={styles.formField}>
                    <label htmlFor="tags">タグ:</label>
                    <div className={styles.tagInputWrapper}>
                        <input
                            type="text"
                            id="tags"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="タグを追加"
                            className={styles.inputText}
                        />
                        <button type="button" onClick={handleAddTag} className={styles.button}>タグ追加</button>
                    </div>
                    <div className={styles.tagsList}>
                        {tags.map((tag, index) => (
                            <div key={index} className={styles.tagItem}>
                                <span className={styles.tag}>{tag}</span>
                                <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.removeTagButton}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className={styles.button} disabled={isSubmitting}>
                    {isSubmitting ? '投稿中...' : '投稿する'}
                </button>
            </form>
        </div>
    );};

export default CreateArticleForm;