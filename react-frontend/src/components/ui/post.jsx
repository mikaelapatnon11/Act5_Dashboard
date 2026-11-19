import React, { useState, useEffect } from 'react';
import { getPost, storePost } from '../../api/post';
import './style/Post.css';
import PostCard from './PostCard';

export default function Post() {
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await getPost();
                setPosts(response.data.data || response.data);
            } catch (err) {
                console.error('Failed to load posts', err);
                setError('Could not load posts. Is the Laravel server running?');
            }
        };
        fetchPosts();
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError('Post cannot be empty');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const response = await storePost({ message });
            const newPost = response.data.data || response.data;

            setPosts((prevPosts) => [newPost, ...prevPosts]);
            setMessage('');
        } catch (err) {
            const errMsg =
                err.response?.data?.message || 'Failed to share post. Please try again.';
            setError(errMsg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="post-container">
            <form className="post-form" onSubmit={submit}>
                <textarea
                    className="post-textarea"
                    placeholder="What is happening?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={processing}
                />

                {error && <p className="post-error">{error}</p>}

                <button className="post-button" type="submit" disabled={processing}>
                    {processing ? 'Posting...' : 'Post'}
                </button>
            </form>

            <div className="post-list">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}