"use client";

import React from "react";
import AuthCheck from "../CreateArticle/AuthCheck";
import ArticleForm from "../CreateArticle/ArticleForm";
import Sidebar from "../components/Sidebar";

const CreateArticle: React.FC = () => {
    const [user, setUser] = React.useState<any>(null);

    return (
        <>
            <AuthCheck setUser={setUser} />
            {user && <ArticleForm />}
            <Sidebar />
        </>
    );
};

export default CreateArticle;
