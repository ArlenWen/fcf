import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ onFilesUploaded, acceptedTypes = '*' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);



  const validateFile = (file) => {
    if (acceptedTypes === '*') return true;
    
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    return allowedTypes.includes(fileExtension);
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const firstFile = fileArray[0];

    if (!firstFile) return;

    if (!validateFile(firstFile)) {
      alert('文件格式不被支持');
      return;
    }

    // 只保留第一个文件，替换现有文件
    const newFiles = [firstFile];
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const clearFile = () => {
    setUploadedFiles([]);
    onFilesUploaded([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      {uploadedFiles.length === 0 && (
        <div
          className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <div className="upload-content">
            <Upload size={48} className="upload-icon" />
            <h3>拖拽文件到此处或点击上传</h3>
            <p>支持格式: {acceptedTypes === '*' ? '所有格式' : acceptedTypes}</p>
            <button className="upload-button">
              选择文件
            </button>
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-compact">
          <div className="files-header-compact">
            <span className="files-count">已上传文件</span>
            <button className="clear-all-btn-compact" onClick={clearFile}>
              重新选择
            </button>
          </div>

          <div className="files-list-compact">
            <div className="file-item-compact">
              <span className="file-name-compact" title={uploadedFiles[0].name}>
                {uploadedFiles[0].name}
              </span>
              <button
                className="remove-file-btn-compact"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(0);
                }}
                title="移除文件"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
