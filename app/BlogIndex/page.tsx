"use client";

import React from 'react';
import styles from '../styles/Blogindex.module.css';
import Sidebar from '../components/Sidebar';


const Schedule: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.post}>投稿記事一覧</h1>
      </div>
      <Sidebar />
    </div>
  );
};

export default Schedule;