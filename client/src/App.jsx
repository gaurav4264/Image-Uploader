import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToastProvider from './components/Toast';
import FileUpload from './components/FileUpload';
import ImageList from './components/ImageList';
import './App.css';

function App() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/images');
            setImages(res.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <ToastProvider>
            <div className="app-container">
                <header className="app-header">
                    <h1>Image Upload & Resize Pipeline</h1>
                    <p className="app-subtitle">Upload, resize, and manage your images instantly</p>
                </header>
                <FileUpload onUploadSuccess={fetchImages} />
                <ImageList images={images} loading={loading} onDelete={fetchImages} />
            </div>
        </ToastProvider>
    );
}

export default App;
