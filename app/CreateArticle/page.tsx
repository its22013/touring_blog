// pages/CreateArticle.tsx
"use client";

import React from 'react';
import Breadcrumbs from "../components/Breadcrumbs";
import Sidebar from "../components/Sidebar";
import CreateArticleForm from './CreateArticleForm'; // Adjust the import according to your project structure
import style from "../styles/CreateArticle.module.css";

const CreateArticle: React.FC = () => {
  return (
    <div className={style.container}>
      <Sidebar />
      <div className={style.form}>
        <Breadcrumbs currentPage='投稿フォーム' />
        <CreateArticleForm />
      </div>
    </div>
  );
};

export default CreateArticle;
