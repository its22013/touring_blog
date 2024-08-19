"use client";

import Link from 'next/link';
import styles from '../styles/Breadcrumbs.module.css'; 

interface BreadcrumbsProps {
    currentPage?: string;
    currentPage02?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage, currentPage02 }) => {
    // `currentPage` に基づいて遷移先URLを決定する関数
    const getCurrentPageHref = () => {
        switch (currentPage) {
            case '宿泊施設を検索':
                return '/SearchHotel'; 
            default:
                return '#';
        }
    };

    return (
        <nav className={styles.breadcrumbs}>
            <div className={styles.home}>
            <Link href="/BlogIndex">HOME</Link> &gt;
            {currentPage && (
                <Link legacyBehavior href={getCurrentPageHref()}>
                    <a className={styles.breadcrumbItem}>{currentPage}</a>
                </Link>
            )}
            {currentPage02 && <span> &gt; <a>{currentPage02}</a></span>}
            </div>
        </nav>
    );
};

export default Breadcrumbs;