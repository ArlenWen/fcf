import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader
} from 'lucide-react';
import { pdfjsLib } from '../utils/pdfConfig'; // 使用统一的PDF.js配置
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import './FilePreview.css';

const FilePreview = ({ files = [], selectedFileIndex = 0, onFileSelect, isFullscreen = false }) => {
  const [previewContent, setPreviewContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const currentFile = files[selectedFileIndex];

  useEffect(() => {
    const loadPreview = async () => {
      if (currentFile) {
        await loadFilePreview(currentFile);
      } else {
        setPreviewContent(null);
        setError(null);
      }
    };

    loadPreview();
  }, [currentFile]); // eslint-disable-line react-hooks/exhaustive-deps

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    if (['txt', 'md', 'csv'].includes(extension)) return 'text';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx'].includes(extension)) return 'excel';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    if (['html', 'htm'].includes(extension)) return 'html';
    
    return 'unknown';
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
      case 'word':
      case 'text':
      case 'html':
        return <FileText size={24} />;
      case 'image':
        return <ImageIcon size={24} />;
      case 'excel':
        return <FileSpreadsheet size={24} />;
      case 'powerpoint':
        return <Presentation size={24} />;
      default:
        return <File size={24} />;
    }
  };

  const loadFilePreview = async (file) => {
    setLoading(true);
    setError(null);
    setPreviewContent(null);

    try {
      const fileType = getFileType(file.name);
      
      switch (fileType) {
        case 'pdf':
          try {
            await loadPdfPreview(file);
          } catch (pdfError) {
            console.warn('PDF预览失败，使用备用方案:', pdfError);
            // 如果PDF预览失败，显示文件信息
            setPreviewContent({
              type: 'pdf-fallback',
              fileName: file.name,
              size: file.size,
              lastModified: file.lastModified,
              error: 'PDF预览暂时不可用，可能是由于浏览器扩展冲突'
            });
          }
          break;
        case 'image':
          await loadImagePreview(file);
          break;
        case 'text':
          await loadTextPreview(file);
          break;
        case 'word':
          await loadWordPreview(file);
          break;
        case 'excel':
          await loadExcelPreview(file);
          break;
        case 'powerpoint':
          loadPowerpointPreview(file);
          break;
        case 'html':
          await loadHtmlPreview(file);
          break;
        default:
          loadDefaultPreview(file);
      }
    } catch (err) {
      console.error('预览加载失败:', err);
      setError('无法加载文件预览');
    } finally {
      setLoading(false);
    }
  };

  const loadPdfPreview = async (file) => {
    try {
      // 简化方案：直接使用浏览器内置PDF查看器
      const url = URL.createObjectURL(file);

      setPreviewContent({
        type: 'pdf-embed',
        url: url,
        fileName: file.name,
        size: file.size
      });

    } catch (error) {
      console.error('PDF预览加载失败:', error);
      throw new Error('PDF文件预览失败，请检查文件格式');
    }
  };

  const loadImagePreview = async (file) => {
    const url = URL.createObjectURL(file);
    setPreviewContent({ type: 'image', url });
  };

  const loadTextPreview = async (file) => {
    const text = await file.text();
    setPreviewContent({ type: 'text', content: text });
  };

  const loadWordPreview = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    setPreviewContent({ type: 'word', html: result.value });
  };

  const loadExcelPreview = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    setPreviewContent({ 
      type: 'excel', 
      data: jsonData.slice(0, 20), // 只显示前20行
      sheetNames: workbook.SheetNames,
      totalRows: jsonData.length
    });
  };

  const loadPowerpointPreview = (file) => {
    setPreviewContent({
      type: 'powerpoint',
      fileName: file.name,
      size: file.size,
      lastModified: file.lastModified
    });
  };

  const loadHtmlPreview = async (file) => {
    const text = await file.text();
    setPreviewContent({ type: 'html', content: text });
  };

  const loadDefaultPreview = (file) => {
    setPreviewContent({ 
      type: 'default', 
      fileName: file.name,
      size: file.size,
      lastModified: file.lastModified
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const handlePrevFile = () => {
    if (selectedFileIndex > 0) {
      onFileSelect(selectedFileIndex - 1);
    }
  };

  const handleNextFile = () => {
    if (selectedFileIndex < files.length - 1) {
      onFileSelect(selectedFileIndex + 1);
    }
  };



  if (!currentFile) {
    return (
      <div className="file-preview">
        <div className="preview-placeholder">
          <File size={64} />
          <h3>选择文件进行预览</h3>
          <p>上传文件后，在此处查看文件内容</p>
        </div>
      </div>
    );
  }

  const fileType = getFileType(currentFile.name);

  return (
    <div className={`file-preview ${isFullscreen ? 'fullscreen-preview' : ''}`}>
      {!isFullscreen && (
        <div className="preview-header">
          <div className="file-info">
            {getFileIcon(fileType)}
            <div className="file-details">
              <h3 className="file-name">{currentFile.name}</h3>
              <p className="file-meta">
                {formatFileSize(currentFile.size)} • {fileType.toUpperCase()}
              </p>
            </div>
          </div>

          {files.length > 1 && (
            <div className="file-navigation">
              <button
                className="nav-btn"
                onClick={handlePrevFile}
                disabled={selectedFileIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="file-counter">
                {selectedFileIndex + 1} / {files.length}
              </span>
              <button
                className="nav-btn"
                onClick={handleNextFile}
                disabled={selectedFileIndex === files.length - 1}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="preview-content">
        {loading && (
          <div className="preview-loading">
            <Loader className="spinner" size={32} />
            <p>正在加载预览...</p>
          </div>
        )}

        {error && (
          <div className="preview-error">
            <AlertCircle size={32} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && previewContent && (
          <div className="preview-display">
            {previewContent.type === 'pdf' && (
              <div className="pdf-preview">
                <canvas
                  ref={canvasRef}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <p className="pdf-info">第 1 页，共 {previewContent.totalPages} 页</p>
              </div>
            )}

            {previewContent.type === 'pdf-embed' && (
              <div className="pdf-embed-preview">
                <embed
                  src={previewContent.url}
                  type="application/pdf"
                  width="100%"
                  height="500px"
                  style={{ borderRadius: '0.375rem' }}
                />
                <div className="pdf-info-bar">
                  <span>PDF文件: {previewContent.fileName}</span>
                  <span>大小: {formatFileSize(previewContent.size)}</span>
                </div>
              </div>
            )}

            {previewContent.type === 'pdf-iframe' && (
              <div className="pdf-iframe-preview">
                <iframe
                  src={previewContent.url + '#toolbar=0&navpanes=0&scrollbar=0'}
                  width="100%"
                  height="500px"
                  style={{ border: 'none', borderRadius: '0.375rem' }}
                  title={`PDF预览: ${previewContent.fileName}`}
                />
                <p className="pdf-info">使用浏览器内置PDF查看器</p>
              </div>
            )}

            {previewContent.type === 'pdf-fallback' && (
              <div className="file-info-preview">
                <div className="info-item">
                  <strong>文件名:</strong> {previewContent.fileName}
                </div>
                <div className="info-item">
                  <strong>文件大小:</strong> {formatFileSize(previewContent.size)}
                </div>
                <div className="info-item">
                  <strong>修改时间:</strong> {formatDate(previewContent.lastModified)}
                </div>
                <div className="info-note">
                  <p>{previewContent.error}</p>
                  <p>建议：尝试禁用PDF相关的浏览器扩展，或使用无痕模式打开页面。</p>
                </div>
              </div>
            )}

            {previewContent.type === 'image' && (
              <div className="image-preview">
                <img src={previewContent.url} alt={currentFile.name} />
              </div>
            )}

            {previewContent.type === 'text' && (
              <div className="text-preview">
                <pre>{previewContent.content}</pre>
              </div>
            )}

            {previewContent.type === 'word' && (
              <div className="word-preview">
                <div dangerouslySetInnerHTML={{ __html: previewContent.html }} />
              </div>
            )}

            {previewContent.type === 'excel' && (
              <div className="excel-preview">
                <div className="excel-info">
                  <p>工作表: {previewContent.sheetNames.join(', ')}</p>
                  <p>总行数: {previewContent.totalRows} (显示前20行)</p>
                </div>
                <div className="excel-table">
                  <table>
                    <tbody>
                      {previewContent.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell || ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(previewContent.type === 'powerpoint' || previewContent.type === 'default') && (
              <div className="file-info-preview">
                <div className="info-item">
                  <strong>文件名:</strong> {previewContent.fileName}
                </div>
                <div className="info-item">
                  <strong>文件大小:</strong> {formatFileSize(previewContent.size)}
                </div>
                <div className="info-item">
                  <strong>修改时间:</strong> {formatDate(previewContent.lastModified)}
                </div>
                {previewContent.type === 'powerpoint' && (
                  <div className="info-note">
                    <p>PowerPoint文件预览功能正在开发中</p>
                  </div>
                )}
              </div>
            )}

            {previewContent.type === 'html' && (
              <div className="html-preview">
                <div className="html-code">
                  <pre><code>{previewContent.content}</code></pre>
                </div>
              </div>
            )}


          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
