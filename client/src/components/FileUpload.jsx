import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function DropSlot({ label, file, onSelect, disabled }) {
  const onDrop = useCallback((accepted) => {
    if (accepted[0]) onSelect(accepted[0]);
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <div
      {...getRootProps()}
      className="rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex-1 min-w-[140px]"
      style={{
        border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
        background: isDragActive ? 'var(--accent-glow)' : 'var(--bg-card)'
      }}
    >
      <input {...getInputProps()} />
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)' }}>{label}</p>
      <p className="text-sm truncate" style={{ color: file ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
        {file ? file.name : 'Drop or click'}
      </p>
    </div>
  );
}

export default function FileUpload({
  onFileAccepted,
  onDualAccepted,
  dual = false,
  uploading,
  progress,
  error
}) {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);

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

  if (dual && onDualAccepted) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Upload two related tables — the AI will infer join keys (e.g. shared <code className="text-xs">id</code> columns).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <DropSlot label="Table A" file={fileA} onSelect={setFileA} disabled={uploading} />
          <DropSlot label="Table B" file={fileB} onSelect={setFileB} disabled={uploading} />
        </div>
        <button
          type="button"
          disabled={!fileA || !fileB}
          onClick={() => fileA && fileB && onDualAccepted(fileA, fileB)}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Upload &amp; analyze both datasets
        </button>
        {error && (
          <div className="rounded-xl p-3 text-sm" style={{
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

  return (
    <div>
      <div
        {...getRootProps()}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
          background: isDragActive ? 'var(--accent-glow)' : 'var(--bg-card)'
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
