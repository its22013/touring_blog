// ログインチェック

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthCheck: React.FC<{ setUser: (user: any) => void }> = ({ setUser }) => {
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                alert("ログインしていません");
            }
        });

        return () => unsubscribe();
    }, [auth, setUser]);

    return null;
};

export default AuthCheck;