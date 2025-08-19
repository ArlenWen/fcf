import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, FileSpreadsheet, Code } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ onFilesUploaded, acceptedTypes = '*' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText size={24} className="file-icon text" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet size={24} className="file-icon spreadsheet" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
        return <Image size={24} className="file-icon image" />;
      case 'html':
      case 'htm':
        return <Code size={24} className="file-icon code" />;
      default:
        return <FileText size={24} className="file-icon default" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (acceptedTypes === '*') return true;
    
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    return allowedTypes.includes(fileExtension);
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length !== fileArray.length) {
      alert('某些文件格式不被支持，已自动过滤');
    }
    
    const newFiles = [...uploadedFiles, ...validFiles];
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

  const clearAllFiles = () => {
    setUploadedFiles([]);
    onFilesUploaded([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
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
          multiple
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

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <div className="files-header">
            <h4>已上传文件 ({uploadedFiles.length})</h4>
            <button className="clear-all-btn" onClick={clearAllFiles}>
              清空所有
            </button>
          </div>
          
          <div className="files-list">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  {getFileIcon(file.name)}
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
