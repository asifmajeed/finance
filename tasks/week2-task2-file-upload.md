# Task: File Upload UI & Placeholder

**Estimated Time**: Week 2, Part 2
**Dependencies**: week1-task2-database-crud.md (database layer)
**Priority**: Medium (Future feature preparation)

---

## Context

Create a file upload interface for bank statements (PDF/images). In v1, this is a **placeholder feature** - users can upload files, but OCR/processing is deferred to v1.1. The UI should be ready, and files should be stored for future processing.

### Tech Stack
- **File Picker**: react-native-document-picker
- **File System**: react-native-fs (for storing file references)
- **Future OCR**: TensorFlow Lite + Tesseract (v1.1)

---

## Feature Scope

### v1 (Current - MVP)
- ✅ File picker UI (PDF, PNG, JPG)
- ✅ Store file reference in database
- ✅ Show uploaded files list
- ✅ Placeholder message: "Statement processing coming soon in next update"
- ✅ Allow manual entry from statements (user types in data)

### v1.1 (Future)
- ❌ OCR for scanned statements
- ❌ PDF text extraction
- ❌ Automatic transaction parsing from statements
- ❌ Table detection and data extraction

---

## Tasks

### 1. Install Dependencies
- [ ] Install `react-native-document-picker`
- [ ] Install `react-native-fs` (for file operations)
- [ ] Link native modules if needed

### 2. File Upload Screen

Create `src/screens/FileUploadScreen.js`:

#### UI Components
- [ ] "Upload Statement" button (prominent CTA)
- [ ] Accepted file types: PDF, PNG, JPG, JPEG
- [ ] File picker opens on button press
- [ ] Show selected file info (name, size, type)
- [ ] "Save" button to store file reference
- [ ] List of previously uploaded files

#### File Info Display
For each uploaded file, show:
- File name
- Upload date
- File size
- File type icon (PDF/Image)
- "View" button (opens file in viewer)
- "Delete" button (removes reference)

### 3. Database Integration

#### Add to `transactions` table (already exists):
```sql
-- File reference stored in raw_data field
source = 'upload'
raw_data = JSON.stringify({ filePath, fileName, fileSize, uploadDate })
```

#### Alternative: Create new table (optional)
```sql
CREATE TABLE uploaded_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT, -- 'pdf', 'image'
  upload_date TEXT NOT NULL,
  processed INTEGER DEFAULT 0, -- For future OCR processing
  created_at TEXT NOT NULL
);
```

Create `src/database/fileService.js`:
- [ ] `saveFileReference(fileData)` - Store file info
- [ ] `getAllFiles()` - Get all uploaded files
- [ ] `deleteFileReference(id)` - Remove file reference
- [ ] `getUnprocessedFiles()` - For future OCR batch processing

### 4. File Picker Implementation

```javascript
import DocumentPicker from 'react-native-document-picker';

export const pickFile = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.images,
      ],
    });

    return {
      uri: result[0].uri,
      name: result[0].name,
      size: result[0].size,
      type: result[0].type,
    };
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled
      return null;
    }
    throw err;
  }
};
```

### 5. File Storage

Create `src/utils/fileStorage.js`:

- [ ] Copy file to app's document directory
- [ ] Generate unique filename to avoid collisions
- [ ] Store file path in database
- [ ] Handle storage errors (disk full, permission denied)

```javascript
import RNFS from 'react-native-fs';

export const saveFile = async (sourceUri, fileName) => {
  try {
    const destPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${fileName}`;
    await RNFS.copyFile(sourceUri, destPath);
    return destPath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
};

export const deleteFile = async (filePath) => {
  try {
    await RNFS.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
```

### 6. Placeholder UI

Create `src/components/ProcessingPlaceholder.js`:

- [ ] Show info banner: "🔄 Statement processing coming soon!"
- [ ] Description: "For now, you can manually enter transactions from your statement"
- [ ] "Add Transaction" button (links to transaction form)
- [ ] Dismiss button (hides banner)

### 7. File Viewer Integration

- [ ] Use `react-native-pdf` for PDF viewing (optional)
- [ ] Use `react-native-image-viewing` for images
- [ ] Tapping file opens in viewer
- [ ] Basic zoom/pan controls

### 8. Navigation Integration

Add to bottom navigation or settings:
- [ ] "Upload Statement" option
- [ ] Badge showing count of unprocessed files (for v1.1)

---

## Deliverables

### Must Have
1. ✅ File picker working (PDF and images)
2. ✅ File saved to app storage
3. ✅ File reference saved in database
4. ✅ List of uploaded files displayed
5. ✅ Placeholder message about future processing
6. ✅ Manual entry option clearly presented
7. ✅ File deletion working

### Nice to Have
- PDF viewer for reviewing statements
- Image viewer with zoom
- File size validation (max 10MB)
- Progress indicator during upload

---

## UI Design

### Upload Screen Layout
```
┌─────────────────────────────┐
│ ← Upload Statement          │
├─────────────────────────────┤
│                              │
│  ╔════════════════════════╗ │
│  ║ 📄                     ║ │
│  ║ Upload bank statement  ║ │
│  ║ (PDF or Image)         ║ │
│  ║                        ║ │
│  ║  [Choose File]         ║ │
│  ╚════════════════════════╝ │
│                              │
│  ⓘ Processing Coming Soon   │
│  ┌──────────────────────┐   │
│  │ For now, manually    │   │
│  │ enter transactions   │   │
│  │ from your statement  │   │
│  │                      │   │
│  │ [Add Transaction]    │   │
│  └──────────────────────┘   │
│                              │
│  Previously Uploaded         │
│  ┌──────────────────────┐   │
│  │ 📄 statement_jan.pdf │   │
│  │ 2.3 MB • Jan 4, 2026 │   │
│  │ [View] [Delete]      │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ 🖼 receipt_dec.jpg    │   │
│  │ 1.1 MB • Dec 28, 2025│   │
│  │ [View] [Delete]      │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

---

## Testing Requirements

### Unit Tests

```javascript
// src/utils/__tests__/fileStorage.test.js
import { saveFile, deleteFile } from '../fileStorage';
import RNFS from 'react-native-fs';

jest.mock('react-native-fs');

describe('File Storage', () => {
  it('should save file to document directory', async () => {
    RNFS.copyFile.mockResolvedValue();

    const result = await saveFile('file:///temp/test.pdf', 'test.pdf');

    expect(result).toContain('test.pdf');
    expect(RNFS.copyFile).toHaveBeenCalled();
  });

  it('should delete file', async () => {
    RNFS.unlink.mockResolvedValue();

    await deleteFile('/path/to/file.pdf');

    expect(RNFS.unlink).toHaveBeenCalledWith('/path/to/file.pdf');
  });

  it('should handle save errors', async () => {
    RNFS.copyFile.mockRejectedValue(new Error('Disk full'));

    await expect(saveFile('source', 'test.pdf')).rejects.toThrow('Failed to save file');
  });
});
```

### Integration Tests

```javascript
// src/screens/__tests__/FileUploadScreen.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FileUploadScreen from '../FileUploadScreen';
import * as fileService from '../../database/fileService';

jest.mock('../../database/fileService');

describe('FileUploadScreen', () => {
  it('should display uploaded files', async () => {
    fileService.getAllFiles.mockResolvedValue([
      { id: 1, file_name: 'statement.pdf', upload_date: '2026-01-04' }
    ]);

    const { getByText } = render(<FileUploadScreen />);

    await waitFor(() => {
      expect(getByText('statement.pdf')).toBeDefined();
    });
  });

  it('should show placeholder message', () => {
    const { getByText } = render(<FileUploadScreen />);

    expect(getByText(/processing coming soon/i)).toBeDefined();
  });

  it('should delete file on delete button press', async () => {
    fileService.getAllFiles.mockResolvedValue([
      { id: 1, file_name: 'test.pdf' }
    ]);
    fileService.deleteFileReference.mockResolvedValue();

    const { getByText } = render(<FileUploadScreen />);

    fireEvent.press(getByText('Delete'));

    await waitFor(() => {
      expect(fileService.deleteFileReference).toHaveBeenCalledWith(1);
    });
  });
});
```

---

## Validation Rules

### File Upload
- File size: Max 10MB
- File types: PDF, PNG, JPG, JPEG only
- Reject corrupted files
- Check available storage before saving

### Error Messages
- "File too large (max 10MB)"
- "Invalid file type"
- "Storage full - please free up space"
- "Failed to save file - please try again"

---

## Error Handling

### Common Scenarios

**No storage permission**: Request permission or show error
**Disk full**: Show clear error, suggest clearing space
**Invalid file**: Show error, explain accepted formats
**File picker cancelled**: Silent failure (no error)

---

## Future Enhancement Notes (v1.1)

Document these for v1.1 planning:

### OCR Processing
- Use Tesseract.js or Google ML Kit for OCR
- Extract text from images/PDFs
- Parse transaction tables
- Auto-populate transactions

### PDF Parsing
- Use pdf.js or native PDF parsing
- Extract text directly (no OCR needed for digital PDFs)
- Detect transaction tables
- Parse amounts, dates, descriptions

### Batch Processing
- Process all unprocessed files in background
- Show progress (X of Y files processed)
- Review and confirm auto-extracted transactions

---

## Privacy & Storage

### Storage Location
- Files stored in app's private document directory
- Not accessible by other apps
- Automatically deleted on app uninstall

### Privacy Policy
- "Uploaded files are stored locally on your device"
- "We do not transmit or share your files"
- "Files are used only for transaction extraction (future feature)"

---

## References

- react-native-document-picker: https://github.com/rnmods/react-native-document-picker
- react-native-fs: https://github.com/itinance/react-native-fs
- react-native-pdf: https://github.com/wonday/react-native-pdf

---

## Next Task

After completing this task, proceed to: **week2-task3-balance-calculations.md**
