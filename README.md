# PDF & Word Contact Number Extractor

A web application that extracts contact numbers from PDF and Word files and generates a new PDF with the extracted numbers.

## Features

- 📱 Extract phone numbers from PDF and Word documents (.pdf, .doc, .docx)
- 🔍 Support for multiple Indian phone number formats
- 📄 Generate a new PDF with extracted contact numbers
- 💻 Frontend-only processing (no server upload required)
- 🎨 Beautiful, responsive UI with drag-and-drop support

## Supported File Formats

- **PDF** (.pdf)
- **Word** (.doc, .docx)

## Supported Phone Number Formats

- 10-digit numbers (9876543210)
- Numbers with country code (+91 9876543210)
- Numbers with formatting (987-654-3210)
- Numbers with "Contact:" prefix
- Numbers starting with 0 (011 format)

## How to Use

1. **Upload File**: Drag and drop your PDF or Word file or click to browse
2. **Extract Numbers**: Click "Extract Contact Numbers" to process the file
3. **Download Results**: Click "Download PDF" to get a new PDF with all extracted numbers

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Quick Start (Recommended)
```bash
# Install all dependencies
npm install
npm run install-client

# Start both backend and frontend together
npm start
```

This will start:
- Backend server on http://localhost:5000
- React frontend on http://localhost:3000

### Manual Setup (Alternative)
```bash
# Backend only
npm install
npm run server

# Frontend only (in separate terminal)
cd client
npm install
npm start
```

## Technology Stack

- **Frontend**: React.js, PDF.js, PDF-lib, Mammoth.js
- **Backend**: Node.js, Express.js, Multer
- **PDF Processing**: Client-side using PDF.js and PDF-lib
- **Word Processing**: Client-side using Mammoth.js

## File Structure

```
├── server.js          # Express server
├── package.json       # Backend dependencies
├── client/
│   ├── src/
│   │   ├── App.js     # Main React component
│   │   ├── index.js   # React entry point
│   │   └── index.css  # Styles
│   └── package.json   # Frontend dependencies
└── uploads/           # Uploaded files (created automatically)
```

## Features in Detail

### File Processing
- Uses PDF.js to extract text from PDF pages
- Uses Mammoth.js to extract text from Word documents
- Regex patterns to identify phone numbers
- Cleans and validates extracted numbers
- Removes duplicates and sorts results

### PDF Generation
- Creates formatted PDF with extracted numbers
- Includes metadata (date, total count)
- Professional layout with proper spacing
- Automatic page breaks for large lists

### User Interface
- Drag-and-drop file upload
- Real-time processing feedback
- Preview of extracted numbers
- One-click PDF download

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- All file processing happens in the browser for privacy
- No files are permanently stored on the server
- Supports PDF and Word files with text content (not scanned images)
- Optimized for Indian phone number formats