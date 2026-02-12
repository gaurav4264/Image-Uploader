import React, { useState } from 'react';
import axios from 'axios';
import { toast, confirmToast } from './Toast';

const ImageList = ({ images, loading, onDelete }) => {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (id, name) => {
        const confirmed = await confirmToast(`Delete "${name || 'this image'}"?`);
        if (!confirmed) return;

        setDeletingId(id);
        try {
            await axios.delete(`/api/images/${id}`);
            toast.success('Image deleted successfully');
            onDelete();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete image. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="image-list-container">
                <div className="section-header">
                    <h2>Recent Uploads</h2>
                </div>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p style={{ color: '#64748b' }}>Loading your images...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="image-list-container">
            <div className="section-header">
                <h2>Recent Uploads</h2>
                {images.length > 0 && (
                    <span className="image-count">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                )}
            </div>

            {images.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🖼️</span>
                    <p>No images uploaded yet.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Upload your first image above to get started!</p>
                </div>
            ) : (
                <div className="image-grid">
                    {images.map((image, index) => (
                        <div
                            key={image._id}
                            className="image-card"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="card-header">
                                <div>
                                    <span className="badge">Uploaded</span>
                                    {image.originalName && (
                                        <span className="filename" title={image.originalName}>
                                            {image.originalName.length > 25
                                                ? image.originalName.slice(0, 22) + '...'
                                                : image.originalName}
                                        </span>
                                    )}
                                </div>
                                <span className="timestamp">
                                    {new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <br />
                                    <small>{new Date(image.createdAt).toLocaleDateString()}</small>
                                </span>
                            </div>
                            <div className="thumbnail-container">
                                <img
                                    src={`/${image.small}`}
                                    alt={image.originalName || 'Small Preview'}
                                    loading="lazy"
                                />
                                <div className="overlay">
                                    <span>150×150 Preview</span>
                                </div>
                            </div>
                            <div className="image-info">
                                <div className="links">
                                    <a href={`/${image.original}`} target="_blank" rel="noopener noreferrer" className="btn-link original">
                                        Original
                                    </a>
                                    <a href={`/${image.medium}`} target="_blank" rel="noopener noreferrer" className="btn-link medium">
                                        Medium
                                    </a>
                                    <a href={`/${image.large}`} target="_blank" rel="noopener noreferrer" className="btn-link large">
                                        Large
                                    </a>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(image._id, image.originalName)}
                                        disabled={deletingId === image._id}
                                    >
                                        {deletingId === image._id ? 'Deleting...' : '🗑 Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageList;
