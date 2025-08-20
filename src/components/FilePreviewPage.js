import React, { useState } from 'react';
import { Eye, Upload, X, Maximize2, Minimize2 } from 'lucide-react';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';
import Notification from './Notification';
import './FilePreviewPage.css';

const FilePreviewPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFilesUploaded = (files) => {
    if (files.length > 0) {
      setUploadedFile(files[0]); // 只处理第一个文件
      setNotification({
        type: 'success',
        message: `成功上传文件：${files[0].name}`
      });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsFullscreen(false);
    setNotification({
      type: 'info',
      message: '文件已移除'
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-preview-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {!uploadedFile ? (
        <>
          <div className="preview-page-header">
            <div className="header-content">
              <div className="header-icon">
                <Eye size={32} />
              </div>
              <div className="header-text">
                <h1>文件预览工具</h1>
                <p>支持PDF、图片、文本、Word、Excel、PowerPoint等多种格式的文件预览</p>
              </div>
            </div>
          </div>

          <div className="preview-page-content">
            <div className="upload-section">
              <div className="upload-container">
                <div className="upload-header">
                  <Upload size={48} />
                  <h2>上传文件开始预览</h2>
                  <p>支持多种文件格式，拖拽或点击上传</p>
                </div>

                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  acceptedTypes="*"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="preview-with-file">
          {/* 顶部文件信息栏 */}
          <div className="file-info-bar">
            <div className="file-info">
              <div className="file-name">{uploadedFile.name}</div>
              <div className="file-size">{formatFileSize(uploadedFile.size)}</div>
            </div>
            <div className="file-actions">
              <button
                className="action-btn fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? "退出全屏" : "全屏预览"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                className="action-btn remove-btn"
                onClick={handleRemoveFile}
                title="移除文件"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 预览区域 */}
          <div className="preview-area">
            <FilePreview
              files={[uploadedFile]}
              selectedFileIndex={0}
              onFileSelect={() => {}}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreviewPage;
