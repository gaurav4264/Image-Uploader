# MERN Image Upload & Resizing Pipeline

This is a complete MERN stack application for uploading images, resizing them on the server, and storing them locally.

## Prerequisites

- Node.js installed
- MongoDB installed and running locally

## Project Structure

```
/
├── client/         # React Frontend
└── server/         # Node.js/Express Backend
    ├── uploads/    # Stored images (created automatically)
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    └── routes/
```

## Setup & Run Instructions

### 1. Database Setup

Ensure your local MongoDB instance is running. The application connects to `mongodb://localhost:27017/image-upload-db`.

```bash
# Verify MongoDB is running (PowerShell)
mongosh
# or
net start MongoDB
```

### 2. Backend Setup

Open a terminal and navigate to the `server` directory:

```bash
cd server
npm install
npm run dev
```

The server will start on **http://localhost:5000**.
It will automatically create the `uploads` folders.

### 3. Frontend Setup

Open a **new** terminal and navigate to the `client` directory:

```bash
cd client
npm install
npm run dev
```

The frontend will start (usually on **http://localhost:5173**).

## Usage

1. Open the frontend URL in your browser.
2. Click "Choose Files" to select one or multiple images.
3. Click "Upload".
4. The backend will:
   - Save the original file.
   - Generate Small (150x150), Medium (500x500), and Large (1000x1000) resized versions.
   - Save metadata to MongoDB.
5. The list of uploaded images will automatically refresh below the upload form.
6. Click "View Original/Medium/Large" links to verify the images are served correctly.

## API Endpoints

- `POST /api/images/upload`: Upload generic images (multipart/form-data). Key: `images`.
- `GET /api/images`: Retrieve metadata for all uploaded images.
