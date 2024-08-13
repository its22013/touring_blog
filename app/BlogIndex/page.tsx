import React from 'react';
import Sidebar from "../components/Sidebar";
import styles from "../styles/List.module.css"
import {images} from "next/dist/build/webpack/config/blocks/images";
import { FcGoogle } from "react-icons/fc";

const Home: React.FC = () => {
  return (
      <div>
          <Sidebar/>
          <div className={styles.container}>
          <h1 className={styles.title}>投稿記事一覧</h1>
              <section>
                  <article className={styles.post}>
                      <div className={styles.iconnemeset}>
                          {/* 自分自身で作成したときのサンプル */}
                          <img src="https://lh3.googleusercontent.com/a/ACg8ocKYmx2TQBWvzPFivTKsXTgtXhBvKXcaApZ9UFSaQV413g3vbg=s96-c" alt="ユーザーアイコン" className={styles.icon}/>
                              <p
                                  className={styles.username}> ユーザー </p>
                      </div>
                      <h2 className={styles.posttitle}>記事タイトル1</h2>
                      <p className={styles.content}>記事内容1。ここに記事の内容が入ります。</p>
                      <p className={styles.day}><strong className={styles.postdate}>投稿日:</strong> 2024年7月31日</p>
                  </article>
                  <article className={styles.post}>
                      <div className={styles.iconnemeset}>
                          <img src="/images/aikonn1.png" className={styles.icon}/><p
                          className={styles.username}> ユーザー </p>
                      </div>
                      <h2 className={styles.posttitle}>記事タイトル1</h2>
                      <p className={styles.content}>記事内容1。ここに記事の内容が入ります。</p>
                      <p className={styles.day}><strong className={styles.postdate}>投稿日:</strong> 2024年7月31日</p>
                  </article>
              </section>
          </div>
import Sidebar from '../components/Sidebar';

const Schedule: React.FC = () => {
  return (
      <div>
        <Sidebar />
      </div>
  );
}

export default Home;