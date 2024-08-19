import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BlogPost } from '../BlogIndex/blogPost';

const BlogList: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get<BlogPost[]>('https://api.example.com/posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Blog Posts</h1>
            <ul>BlogList
                {posts.map(post => (
                    <li key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <small>{post.author} - {new Date(post.date).toLocaleDateString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlogList;
