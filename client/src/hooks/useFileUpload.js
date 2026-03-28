import { useState } from 'react';
import { uploadFile, uploadDualFiles } from '../lib/api';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fileData, setFileData] = useState(null);

  const upload = async (file) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const data = await uploadFile(file, (pct) => setProgress(pct));
      setFileData(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadDual = async (file1, file2) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const data = await uploadDualFiles(file1, file2, (pct) => setProgress(pct));
      setFileData(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setError(null);
    setProgress(0);
  };

  return { uploading, progress, error, fileData, upload, uploadDual, reset };
}
