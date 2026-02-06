# Changelog

## Version 1.1.0 - Word File Support Added

### New Features
- ✅ Added support for Word documents (.doc, .docx)
- ✅ Integrated Mammoth.js for Word file text extraction
- ✅ Updated file upload to accept multiple formats
- ✅ Enhanced UI to reflect Word file support

### Technical Changes
- Added `mammoth` package for Word document processing
- Updated file validation to accept PDF and Word MIME types
- Modified text extraction logic to handle both PDF and Word files
- Updated UI text and instructions to mention Word files

### Supported File Types
- PDF (.pdf)
- Word 97-2003 (.doc)
- Word 2007+ (.docx)

### How It Works
1. User uploads PDF or Word file
2. App detects file type automatically
3. Extracts text using appropriate library:
   - PDF.js for PDF files
   - Mammoth.js for Word files
4. Searches for phone numbers using regex patterns
5. Generates clean PDF with extracted contacts

---

## Version 1.0.0 - Initial Release

### Features
- PDF contact number extraction
- Beautiful UI with instructions panel
- Drag and drop file upload
- PDF generation with extracted numbers
- Concurrent backend and frontend startup
- Git repository setup