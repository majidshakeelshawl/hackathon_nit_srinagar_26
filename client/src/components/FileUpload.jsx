import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({ onFileAccepted, uploading, progress, error }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: uploading
  });

  if (uploading) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ 
        background: 'var(--bg-card)', 
        border: '2px solid var(--accent)' 
      }}>
        <div className="mb-4">
          <svg className="mx-auto animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--bg-tertiary)" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Uploading & analyzing...</p>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>
          {progress}%
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
          background: isDragActive ? 'var(--accent-glow)' : 'var(--bg-card)',
        }}
      >
        <input {...getInputProps()} />
        <div className="mb-4">
          <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isDragActive ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-lg font-semibold mb-1" style={{ color: isDragActive ? 'var(--accent)' : 'var(--text-primary)' }}>
          {isDragActive ? 'Drop it here!' : 'Drop your CSV or Excel file here'}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>or click to browse</p>
        <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>Supports CSV, XLSX, XLS · Up to 50MB</p>
      </div>

      {error && (
        <div className="mt-3 rounded-xl p-3 text-sm" style={{ 
          background: 'rgba(248,113,113,0.1)', 
          border: '1px solid var(--danger)',
          color: 'var(--danger)'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
