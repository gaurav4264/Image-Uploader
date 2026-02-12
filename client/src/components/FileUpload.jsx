import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from './Toast';

const FileUpload = ({ onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Revoke old object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const processFiles = useCallback((selectedFiles) => {
        const imageFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            toast.warning('Only image files are accepted');
            return;
        }

        const totalFiles = files.length + imageFiles.length;
        if (totalFiles > 10) {
            toast.warning('Maximum 10 files per upload');
            return;
        }

        setFiles(prev => [...prev, ...imageFiles]);
        previews.forEach(url => URL.revokeObjectURL(url));
        const allFiles = [...files, ...imageFiles];
        const newPreviews = allFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    }, [files, previews]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    };

    const removeFile = (index) => {
        URL.revokeObjectURL(previews[index]);
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const clearAll = () => {
        previews.forEach(url => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.warning('Please select files first');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        setLoading(true);
        setProgress(0);

        try {
            const res = await axios.post('/api/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                }
            });
            toast.success(`${res.data.images.length} image(s) uploaded and processed successfully!`);
            clearAll();
            onUploadSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.message || 'Upload failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload Images</h2>
            <p className="upload-hint">Supports JPEG, PNG, GIF, WebP · Max 10 MB per file · Up to 10 files</p>

            <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <span className="dropzone-icon">📁</span>
                <p className="dropzone-text">
                    Drag & drop images here, or <strong onClick={() => fileInputRef.current?.click()}>browse files</strong>
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                />
            </div>

            {previews.length > 0 && (
                <div className="preview-container">
                    {previews.map((preview, index) => (
                        <div key={index} className="preview-wrapper">
                            <img src={preview} alt="Preview" className="preview-image" />
                            <button
                                className="preview-remove"
                                onClick={() => removeFile(index)}
                                title="Remove"
                            >×</button>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="progress-text">
                        {progress < 100 ? `Uploading... ${progress}%` : 'Processing images...'}
                    </p>
                </>
            )}

            <div className="upload-actions">
                <button
                    className="btn-upload"
                    onClick={handleUpload}
                    disabled={loading || files.length === 0}
                >
                    {loading ? 'Processing...' : `Upload${files.length > 0 ? ` (${files.length})` : ''}`}
                </button>
                {files.length > 0 && !loading && (
                    <button className="btn-clear" onClick={clearAll}>Clear</button>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
