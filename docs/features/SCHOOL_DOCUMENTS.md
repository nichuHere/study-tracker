# School Documents

## Overview

Document management system for storing and displaying school-related files. Supports a pinned timetable that's always visible, plus additional documents like circulars, schedules, and other PDFs.

---

## Requirements

### Functional Requirements
- Upload timetable image (replaces previous if exists)
- Upload additional documents (images, PDFs)
- Preview images inline
- Open PDFs in new tab
- Add descriptions to documents
- Delete documents
- Pin timetable for constant visibility

### Non-Functional Requirements
- Documents scoped to active profile
- File size limit: 5MB
- Allowed formats: PNG, JPG, PDF
- Secure storage via Supabase Storage

---

## Data Model

### School Document
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| profile_id | BIGINT | Foreign key to profiles |
| file_name | TEXT | Original file name |
| file_url | TEXT | Public URL in storage |
| file_type | TEXT | MIME type |
| document_type | TEXT | 'timetable' or 'other' |
| description | TEXT | User-provided description |
| created_at | TIMESTAMP | Upload timestamp |

### Storage Structure
```
school-documents/
└── {profile_id}/
    └── {profile_id}_{timestamp}.{ext}
```

---

## Business Rules

1. **Timetable**:
   - Only one timetable per profile
   - Uploading new timetable replaces old one
   - Always visible at top of documents section

2. **File Validation**:
   - Allowed types: image/png, image/jpeg, image/jpg, application/pdf
   - Maximum size: 5MB
   - Invalid files show error alert

3. **Document Display**:
   - Images: Inline preview with click to expand
   - PDFs: Icon with "View" button (opens new tab)

4. **Deletion**:
   - Deletes from both database and storage
   - Confirmation required

---

## User Interface

### Documents Section
**Timetable Area (top)**
- Timetable image (if exists)
- "Upload Timetable" button

**Documents List**
- Grid of document cards
- Each card shows:
  - Thumbnail (image) or PDF icon
  - File name
  - Description (if any)
  - View/Delete buttons
- "Upload Document" button

### Upload Modal
| Field | Input Type | Purpose |
|-------|------------|---------|
| Document Type | Radio | Timetable / Other |
| File | File input | Select file |
| Description | Textarea | Optional description |

### Preview Modal
- Full-size image display
- Close button
- File name header

---

## API Operations

### Load Documents
```javascript
const { data } = await supabase
  .from('school_documents')
  .select('*')
  .eq('profile_id', profileId)
  .order('created_at', { ascending: false });
```

### Upload Document
```javascript
// 1. Upload to Storage
const filePath = `${profileId}/${profileId}_${Date.now()}.${fileExt}`;
const { error: uploadError } = await supabase.storage
  .from('school-documents')
  .upload(filePath, file);

// 2. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('school-documents')
  .getPublicUrl(filePath);

// 3. Save to database
const { data, error } = await supabase
  .from('school_documents')
  .insert([{
    profile_id: profileId,
    file_name: file.name,
    file_url: publicUrl,
    file_type: file.type,
    document_type: uploadType,
    description: description
  }])
  .select();
```

### Delete Document
```javascript
// 1. Extract file path from URL
const filePath = extractFilePath(document.file_url);

// 2. Delete from storage
await supabase.storage
  .from('school-documents')
  .remove([filePath]);

// 3. Delete from database
const { error } = await supabase
  .from('school_documents')
  .delete()
  .eq('id', documentId);
```

---

## Storage Configuration

### Bucket: school-documents

**Policies (set in Supabase Dashboard):**
```sql
-- Allow authenticated users to read own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to upload
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-documents');

-- Allow authenticated users to delete own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## State Management

| State | Type | Description |
|-------|------|-------------|
| documents | array | Non-timetable documents |
| timetable | object | Current timetable document |
| uploading | boolean | Upload in progress |
| showUploadModal | boolean | Upload modal visibility |
| showDocumentsModal | boolean | Documents list modal |
| previewDocument | object | Document being previewed |
| uploadType | string | 'timetable' or 'other' |
| description | string | Form input for description |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| SchoolDocuments | `src/components/SchoolDocuments.jsx` | All document management |

---

## Related Specs

- [PROFILES.md](PROFILES.md) - Documents scoped to profile
- [DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md) - Table structure
