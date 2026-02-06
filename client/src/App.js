import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
    const [file, setFile] = useState(null);
    const [extractedContacts, setExtractedContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Phone number regex patterns for Indian numbers
    const phonePatterns = [
        /\b\d{10}\b/g, // 10 digit numbers
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // XXX-XXX-XXXX format
        /\b\+91[-.\s]?\d{10}\b/g, // +91 followed by 10 digits
        /\b91[-.\s]?\d{10}\b/g, // 91 followed by 10 digits
        /\b0\d{10}\b/g, // 0 followed by 10 digits
        /\bContact:\s*(\d{10})\b/gi, // Contact: followed by 10 digits
        /\bContact:\s*(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/gi, // Contact: with formatted number
    ];

    const handleFileSelect = (selectedFile) => {
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (selectedFile && validTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setError('');
            setSuccess('');
            setExtractedContacts([]);
        } else {
            setError('Please select a valid PDF or Word file (.pdf, .doc, .docx)');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const extractContactNumbers = async () => {
        if (!file) {
            setError('Please select a PDF or Word file first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let allText = '';

            // Check file type and extract text accordingly
            if (file.type === 'application/pdf') {
                // Extract from PDF
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    allText += pageText + ' ';
                }
            } else if (
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
                // Extract from Word document
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                allText = result.value;
            }

            // Extract phone numbers using multiple patterns
            const contacts = new Set();

            phonePatterns.forEach(pattern => {
                const matches = allText.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // Clean the number
                        let cleanNumber = match.replace(/[^\d]/g, '');

                        // Handle different formats
                        if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
                            cleanNumber = cleanNumber.substring(2); // Remove country code
                        } else if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
                            cleanNumber = cleanNumber.substring(1); // Remove leading 0
                        }

                        // Only add 10-digit numbers
                        if (cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber)) {
                            contacts.add(cleanNumber);
                        }
                    });
                }
            });

            const contactArray = Array.from(contacts).sort();
            setExtractedContacts(contactArray);

            if (contactArray.length > 0) {
                setSuccess(`Found ${contactArray.length} contact numbers!`);
            } else {
                setError('No contact numbers found in the file');
            }
        } catch (err) {
            setError('Error processing file: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        if (extractedContacts.length === 0) {
            setError('No contacts to generate PDF');
            return;
        }

        try {
            setLoading(true);

            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let page = pdfDoc.addPage([595, 842]); // A4 size
            const { width, height } = page.getSize();


            // Total count
            page.drawText(`Total Numbers Found: ${extractedContacts.length}`, {
                x: 50,
                y: height - 110,
                size: 14,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            let yPosition = height - 150;
            const lineHeight = 25;
            let contactIndex = 1;

            extractedContacts.forEach((contact, index) => {
                if (yPosition < 50) {
                    // Add new page if current page is full
                    page = pdfDoc.addPage([595, 842]);
                    yPosition = height - 50;
                }

                page.drawText(`${contact}`, {
                    x: 50,
                    y: yPosition,
                    size: 12,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                yPosition -= lineHeight;
                contactIndex++;
            });

            const pdfBytes = await pdfDoc.save();

            // Download the PDF
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `extracted-contacts-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSuccess('PDF generated and downloaded successfully!');
        } catch (err) {
            setError('Error generating PDF: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="main-layout">
                <div className="card">
                    <h1 className="title">📱 PDF & Word Contact Extractor</h1>
                    <p className="subtitle">Upload a PDF or Word file to extract contact numbers and generate a new PDF</p>

                    <div
                        className={`upload-area ${dragOver ? 'dragover' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-icon">📄</div>
                        <div className="upload-text">
                            {file ? file.name : 'Drag and drop your PDF or Word file here or click to browse'}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                            className="file-input"
                        />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn"
                            onClick={extractContactNumbers}
                            disabled={!file || loading}
                        >
                            {loading ? 'Processing...' : 'Extract Contact Numbers'}
                        </button>

                        {extractedContacts.length > 0 && (
                            <button
                                className="btn"
                                onClick={generatePDF}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Download PDF'}
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div className="loading">
                            <div className="spinner"></div>
                            <span>Processing PDF...</span>
                        </div>
                    )}

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    {extractedContacts.length > 0 && (
                        <div className="results">
                            <h3>Found {extractedContacts.length} Contact Numbers:</h3>
                            <ul className="contact-list">
                                {extractedContacts.slice(0, 10).map((contact, index) => (
                                    <li key={index} className="contact-item">{contact}</li>
                                ))}
                                {extractedContacts.length > 10 && (
                                    <li className="contact-item">... and {extractedContacts.length - 10} more</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="instructions-panel">
                    <h3 className="instructions-title">📋 How to Use</h3>
                    <div className="instruction-steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-text">Upload PDF or Word file</div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-text">Click on Extract Contact Numbers</div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-text">Download</div>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-text">Refresh page to go home screen</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;