// components/Breadcrumbs.tsx

"use client";

import Link from 'next/link';
import styles from '../styles/Breadcrumbs.module.css'; // スタイルは別ファイルで管理

interface BreadcrumbsProps {
    currentPage?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage }) => {
    return (
        <nav className={styles.breadcrumbs}>
            <Link href="/BlogIndex">HOME</Link> &gt;
            {currentPage && <span> {currentPage}</span>}
        </nav>
    );
};

export default Breadcrumbs;