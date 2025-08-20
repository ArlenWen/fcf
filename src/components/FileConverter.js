import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Image,
  FileSpreadsheet,
  Code,
  Download
} from 'lucide-react';
import FileUpload from './FileUpload';
import ConversionTabs from './ConversionTabs';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';
import { convertFile, convertPdfToImages } from '../utils/fileConverter';
import './FileConverter.css';

const FileConverter = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('pdf');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [notification, setNotification] = useState(null);

  const tabs = useMemo(() => [
    {
      id: 'pdf',
      title: 'PDF转换',
      icon: FileText,
      description: '将PDF转换为图片、文本等格式'
    },
    {
      id: 'word',
      title: 'Word转换',
      icon: FileText,
      description: '将Word文档转换为HTML格式'
    },
    {
      id: 'excel',
      title: 'Excel转换',
      icon: FileSpreadsheet,
      description: '将Excel表格转换为HTML、CSV等格式'
    },
    {
      id: 'image',
      title: '图片转换',
      icon: Image,
      description: '图片格式转换和转换为PDF'
    },
    {
      id: 'html',
      title: 'HTML转换',
      icon: Code,
      description: '将HTML转换为PDF格式'
    },
    {
      id: 'csv',
      title: 'CSV转换',
      icon: FileSpreadsheet,
      description: '将CSV文件转换为Excel格式'
    },
    {
      id: 'text',
      title: '文本转换',
      icon: FileText,
      description: '将文本文件转换为HTML格式'
    }
  ], []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.find(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, tabs]);

  const handleFilesUploaded = (files) => {
    setUploadedFiles(files);
    setConvertedFiles([]);
    if (files.length > 0) {
      setNotification({
        type: 'success',
        message: `成功上传 ${files.length} 个文件！`
      });
    }
  };

  const handleConvert = async (targetFormat) => {
    if (uploadedFiles.length === 0) return;

    setIsConverting(true);
    setConversionProgress(0);
    setConvertedFiles([]);

    try {
      const converted = [];
      const totalFiles = uploadedFiles.length;

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        try {
          const sourceExtension = file.name.split('.').pop().toLowerCase();
          const isPdfToImage = sourceExtension === 'pdf' && ['png', 'jpg', 'jpeg'].includes(targetFormat);

          if (isPdfToImage) {
            // PDF转图片：处理多个输出文件
            const convertedFiles = await convertPdfToImages(file, targetFormat);
            const filesArray = Array.isArray(convertedFiles) ? convertedFiles : [convertedFiles];

            // 为每个生成的图片文件创建一个条目
            filesArray.forEach((convertedFile, pageIndex) => {
              converted.push({
                originalFile: file,
                convertedFile,
                targetFormat,
                success: true,
                pageNumber: filesArray.length > 1 ? pageIndex + 1 : null,
                totalPages: filesArray.length > 1 ? filesArray.length : null
              });
            });
          } else {
            // 其他转换：单个输出文件
            const convertedFile = await convertFile(file, targetFormat);
            converted.push({
              originalFile: file,
              convertedFile,
              targetFormat,
              success: true
            });
          }

          setConversionProgress(Math.round(((i + 1) / totalFiles) * 100));
        } catch (error) {
          console.error(`转换文件 ${file.name} 失败:`, error);
          converted.push({
            originalFile: file,
            convertedFile: null,
            targetFormat,
            success: false,
            error: error.message
          });
        }
      }

      setConvertedFiles(converted);

      const successCount = converted.filter(item => item.success).length;
      const failCount = converted.length - successCount;

      if (failCount === 0) {
        setNotification({
          type: 'success',
          message: `成功转换 ${successCount} 个文件！`
        });
      } else if (successCount === 0) {
        setNotification({
          type: 'error',
          message: `转换失败！${failCount} 个文件转换出错。`
        });
      } else {
        setNotification({
          type: 'warning',
          message: `部分转换完成：${successCount} 个成功，${failCount} 个失败。`
        });
      }
    } catch (error) {
      console.error('转换失败:', error);
      setNotification({
        type: 'error',
        message: '转换过程中发生错误，请重试。'
      });
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  };



  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    const successfulFiles = convertedFiles.filter(item => item.success);
    successfulFiles.forEach((item, index) => {
      setTimeout(() => {
        downloadFile(item.convertedFile);
      }, index * 100); // 延迟下载避免浏览器阻止
    });
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="file-converter">
      {isConverting && (
        <LoadingSpinner
          message="正在转换文件，请稍候..."
          progress={conversionProgress}
        />
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="converter-header">
        <h1>文件转换工具</h1>
        <p>支持PDF、Word、Excel、HTML、图片等多种格式的相互转换</p>
      </div>

      <div className="converter-content">
        <div className="tab-description">
          <h2>{currentTab?.title}</h2>
          <p>{currentTab?.description}</p>
        </div>

        <FileUpload
          onFilesUploaded={handleFilesUploaded}
          acceptedTypes={getAcceptedTypes(activeTab)}
        />

        {uploadedFiles.length > 0 && (
          <ConversionTabs
            activeTab={activeTab}
            uploadedFiles={uploadedFiles}
            onConvert={handleConvert}
            isConverting={isConverting}
          />
        )}

        {convertedFiles.length > 0 && (
          <div className="converted-files">
            <div className="converted-files-header">
              <h3>转换完成</h3>
              {convertedFiles.filter(item => item.success).length > 1 && (
                <button
                  className="download-all-btn"
                  onClick={downloadAllFiles}
                >
                  <Download size={16} />
                  下载全部 ({convertedFiles.filter(item => item.success).length} 个文件)
                </button>
              )}
            </div>
            <div className="file-list">
              {convertedFiles.map((item, index) => (
                <div key={index} className="converted-file-item">
                  {item.success ? (
                    <>
                      <div className="file-info">
                        <FileText size={24} />
                        <div>
                          <div className="file-name">
                            {item.convertedFile.name}
                            {item.pageNumber && (
                              <span className="page-info"> (第 {item.pageNumber}/{item.totalPages} 页)</span>
                            )}
                          </div>
                          <div className="file-size">
                            {(item.convertedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        className="download-btn"
                        onClick={() => downloadFile(item.convertedFile)}
                      >
                        <Download size={16} />
                        下载
                      </button>
                    </>
                  ) : (
                    <div className="conversion-error">
                      <div className="file-info">
                        <FileText size={24} style={{ color: '#ef4444' }} />
                        <div>
                          <div className="file-name">{item.originalFile.name}</div>
                          <div className="error-message">转换失败: {item.error}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getAcceptedTypes = (tabId) => {
  const typeMap = {
    'pdf': '.pdf',
    'word': '.doc,.docx',
    'excel': '.xls,.xlsx',
    'image': '.png,.jpg,.jpeg,.gif,.bmp,.webp',
    'html': '.html,.htm',
    'csv': '.csv',
    'text': '.txt'
  };
  return typeMap[tabId] || '*';
};

export default FileConverter;
