import React, { useState } from 'react';
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Code, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import './ConversionTabs.css';

const ConversionTabs = ({ activeTab, uploadedFiles, onConvert, isConverting }) => {
  const [selectedFormat, setSelectedFormat] = useState('');

  const conversionOptions = {
    pdf: [
      { value: 'png', label: 'PNG图片 (.png)', icon: Image },
      { value: 'jpg', label: 'JPG图片 (.jpg)', icon: Image },
      { value: 'jpeg', label: 'JPEG图片 (.jpeg)', icon: Image },
      { value: 'txt', label: '文本文件 (.txt)', icon: FileText }
    ],
    word: [
      { value: 'html', label: 'HTML网页 (.html)', icon: Code }
    ],
    excel: [
      { value: 'html', label: 'HTML网页 (.html)', icon: Code },
      { value: 'csv', label: 'CSV文件 (.csv)', icon: FileSpreadsheet }
    ],
    image: [
      { value: 'pdf', label: 'PDF文档 (.pdf)', icon: FileText },
      { value: 'png', label: 'PNG图片 (.png)', icon: Image },
      { value: 'jpg', label: 'JPG图片 (.jpg)', icon: Image },
      { value: 'jpeg', label: 'JPEG图片 (.jpeg)', icon: Image }
    ],
    html: [
      { value: 'pdf', label: 'PDF文档 (.pdf)', icon: FileText }
    ],
    csv: [
      { value: 'xlsx', label: 'Excel表格 (.xlsx)', icon: FileSpreadsheet }
    ],
    text: [
      { value: 'html', label: 'HTML网页 (.html)', icon: Code }
    ]
  };

  const getSourceFormat = () => {
    if (uploadedFiles.length === 0) return '';

    const firstFile = uploadedFiles[0];
    const extension = firstFile.name.split('.').pop().toLowerCase();

    const formatMap = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'csv': 'CSV',
      'txt': '文本',
      'png': '图片',
      'jpg': '图片',
      'jpeg': '图片',
      'gif': '图片',
      'bmp': '图片',
      'webp': '图片',
      'html': 'HTML',
      'htm': 'HTML'
    };

    return formatMap[extension] || '文件';
  };

  const handleConvert = () => {
    if (selectedFormat && uploadedFiles.length > 0) {
      onConvert(selectedFormat);
    }
  };

  const options = conversionOptions[activeTab] || [];
  const sourceFormat = getSourceFormat();

  return (
    <div className="conversion-tabs">
      <div className="conversion-header">
        <h3>选择转换格式</h3>
        <p>将您的{sourceFormat}文件转换为以下格式之一：</p>
      </div>

      <div className="format-options">
        {options.map(option => {
          const Icon = option.icon;
          return (
            <div
              key={option.value}
              className={`format-option ${selectedFormat === option.value ? 'selected' : ''}`}
              onClick={() => setSelectedFormat(option.value)}
            >
              <div className="format-content">
                <Icon size={32} />
                <div className="format-info">
                  <div className="format-label">{option.label}</div>
                  <div className="format-description">
                    {getFormatDescription(option.value)}
                  </div>
                </div>
              </div>
              <div className="format-radio">
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={selectedFormat === option.value}
                  onChange={() => setSelectedFormat(option.value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {selectedFormat && (
        <div className="conversion-preview">
          <div className="conversion-flow">
            <div className="source-format">
              <span>{sourceFormat}</span>
              <div className="file-count">{uploadedFiles.length} 个文件</div>
            </div>
            <ArrowRight size={24} className="arrow-icon" />
            <div className="target-format">
              <span>{options.find(opt => opt.value === selectedFormat)?.label}</span>
            </div>
          </div>
          
          <button
            className="convert-button"
            onClick={handleConvert}
            disabled={isConverting}
          >
            {isConverting ? (
              <>
                <Loader2 size={20} className="spinning" />
                转换中...
              </>
            ) : (
              <>
                开始转换
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const getFormatDescription = (format) => {
  const descriptions = {
    'pdf': '便携式文档格式，适合打印和分享',
    'docx': 'Microsoft Word文档格式',
    'xlsx': 'Microsoft Excel表格格式',
    'csv': '逗号分隔值格式，通用数据交换格式',
    'html': '网页格式，可在浏览器中查看',
    'txt': '纯文本格式，兼容性最好',
    'png': '高质量图片格式，支持透明背景',
    'jpg': '常用图片格式，文件较小',
    'jpeg': '标准图片格式，压缩率高'
  };
  return descriptions[format] || '';
};

export default ConversionTabs;
