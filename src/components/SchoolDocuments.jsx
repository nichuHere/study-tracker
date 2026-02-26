import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Eye, Trash2, Pin } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SchoolDocuments = ({ profileId }) => {
  const [documents, setDocuments] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [uploadType, setUploadType] = useState('other');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (profileId) {
      loadDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('school_documents')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const timetableDoc = data.find(doc => doc.document_type === 'timetable');
        const otherDocs = data.filter(doc => doc.document_type === 'other');
        setTimetable(timetableDoc);
        setDocuments(otherDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG, JPG, and PDF files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}_${Date.now()}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;

      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('school-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('school-documents')
        .getPublicUrl(filePath);

      // Save document record to database
      const { data: _data, error } = await supabase
        .from('school_documents')
        .insert([{
          profile_id: profileId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          document_type: uploadType,
          description: description || null
        }])
        .select();

      if (error) throw error;

      // If uploading a new timetable, delete the old one
      if (uploadType === 'timetable' && timetable) {
        await deleteDocument(timetable.id, true);
      }

      await loadDocuments();
      setShowUploadModal(false);
      setDescription('');
      setUploadType('other');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId, skipReload = false) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('school_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      if (!skipReload) {
        await loadDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const renderDocumentPreview = (doc) => {
    if (doc.file_type?.startsWith('image/')) {
      return (
        <img 
          src={doc.file_url} 
          alt={doc.file_name} 
          className="w-full h-auto rounded-lg shadow-md"
        />
      );
    } else if (doc.file_type === 'application/pdf') {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{doc.file_name}</p>
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Eye className="w-4 h-4" />
            Open PDF
          </a>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Timetable Section - Always Visible */}
      {timetable && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-500">Class Timetable</h2>
            </div>
            <button
              onClick={() => deleteDocument(timetable.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete timetable"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {renderDocumentPreview(timetable)}
        </div>
      )}

      {/* Other Documents Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"
        >
          <Upload className="w-4 h-4" />
          Upload School Document
        </button>

        {documents.length > 0 && (
          <button
            onClick={() => setShowDocumentsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md"
          >
            <FileText className="w-4 h-4" />
            View Documents ({documents.length})
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-500">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Document Type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="timetable">Timetable (Fixed on page)</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Science Lab Rules, Exam Schedule"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Select File (PNG, JPG, PDF, or Word Doc - Max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {uploading && (
                <div className="text-center text-indigo-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents List Modal */}
      {showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-500">School Documents</h2>
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setPreviewDocument(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewDocument ? (
              <div className="space-y-4">
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  ← Back to list
                </button>
                <h3 className="font-semibold text-lg">{previewDocument.file_name}</h3>
                {previewDocument.description && (
                  <p className="text-gray-600">{previewDocument.description}</p>
                )}
                {renderDocumentPreview(previewDocument)}
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {doc.file_type?.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-500">{doc.file_name}</p>
                        {doc.description && (
                          <p className="text-sm text-gray-500">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDocument(doc)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDocuments;
