// import { PDFDocument, rgb } from 'pdf-lib'; // 保留以备将来使用
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 设置PDF.js worker - 使用本地文件避免CORS问题
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

// PDF相关转换
export const convertPdfToImage = async (file, format = 'png') => {
  try {
    console.log('Converting PDF to image:', file.name);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // 获取第一页进行转换
    const page = await pdf.getPage(1);
    const scale = 2.0; // 提高分辨率
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const convertedFile = new File([blob], `${file.name.split('.')[0]}.${format}`, {
          type: format === 'png' ? 'image/png' : 'image/jpeg'
        });
        resolve(convertedFile);
      }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    });
  } catch (error) {
    console.error('PDF to image conversion failed:', error);
    throw new Error(`PDF转换失败: ${error.message}`);
  }
};

// PDF到文本转换
export const convertPdfToText = async (file) => {
  try {
    console.log('Converting PDF to text:', file.name);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // 遍历所有页面提取文本
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      fullText += `--- 第 ${pageNum} 页 ---\n${pageText}\n\n`;
    }

    const blob = new Blob([fullText], { type: 'text/plain' });
    return new File([blob], `${file.name.split('.')[0]}.txt`, { type: 'text/plain' });
  } catch (error) {
    console.error('PDF to text conversion failed:', error);
    throw new Error(`PDF文本提取失败: ${error.message}`);
  }
};

// Word文档转换
export const convertWordToHtml = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({
      arrayBuffer,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ]
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${file.name}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
          }
          h1, h2, h3 { color: #2c3e50; margin-top: 2em; }
          h1 { font-size: 2em; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          h2 { font-size: 1.5em; color: #34495e; }
          h3 { font-size: 1.2em; color: #7f8c8d; }
          p { margin-bottom: 1em; text-align: justify; }
          strong { color: #2c3e50; }
          em { color: #8e44ad; }
          ul, ol { margin-left: 20px; }
          blockquote {
            border-left: 4px solid #3498db;
            margin-left: 0;
            padding-left: 20px;
            color: #7f8c8d;
          }
        </style>
      </head>
      <body>
        <h1>文档: ${file.name}</h1>
        ${result.value}
        ${result.messages.length > 0 ? `
        <hr>
        <h3>转换信息:</h3>
        <ul>
          ${result.messages.map(msg => `<li>${msg.message}</li>`).join('')}
        </ul>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return new File([blob], `${file.name.split('.')[0]}.html`, { type: 'text/html' });
  } catch (error) {
    console.error('Word to HTML conversion failed:', error);
    throw new Error(`Word文档转换失败: ${error.message}`);
  }
};

// Excel转换
export const convertExcelToHtml = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${file.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background-color: #f8f9fa;
          }
          .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
          h2 {
            color: #34495e;
            margin-top: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            font-weight: bold;
            text-align: center;
          }
          tr:nth-child(even) { background-color: #f8f9fa; }
          tr:hover { background-color: #e3f2fd; }
          .sheet-info {
            background: #e8f5e8;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            border-left: 4px solid #27ae60;
          }
          .number { text-align: right; font-family: 'Courier New', monospace; }
          .date { text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Excel文件: ${file.name}</h1>
    `;

    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const rowCount = range.e.r - range.s.r + 1;
      const colCount = range.e.c - range.s.c + 1;

      htmlContent += `
        <h2>📋 工作表: ${sheetName}</h2>
        <div class="sheet-info">
          <strong>数据范围:</strong> ${rowCount} 行 × ${colCount} 列 |
          <strong>工作表序号:</strong> ${index + 1}/${workbook.SheetNames.length}
        </div>
      `;

      // 转换为HTML表格，并添加样式
      const htmlTable = XLSX.utils.sheet_to_html(worksheet, {
        id: `sheet-${index}`,
        editable: false
      });

      htmlContent += htmlTable.replace(/<table/g, '<table class="data-table"');
    });

    htmlContent += `
        </div>
        <script>
          // 添加一些交互功能
          document.querySelectorAll('td').forEach(cell => {
            if (!isNaN(cell.textContent) && cell.textContent.trim() !== '') {
              cell.classList.add('number');
            }
            if (cell.textContent.match(/\\d{4}-\\d{2}-\\d{2}|\\d{2}\\/\\d{2}\\/\\d{4}/)) {
              cell.classList.add('date');
            }
          });
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return new File([blob], `${file.name.split('.')[0]}.html`, { type: 'text/html' });
  } catch (error) {
    console.error('Excel to HTML conversion failed:', error);
    throw new Error(`Excel转换失败: ${error.message}`);
  }
};

// Excel转CSV
export const convertExcelToCsv = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 转换第一个工作表为CSV
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    return new File([blob], `${file.name.split('.')[0]}.csv`, { type: 'text/csv' });
  } catch (error) {
    console.error('Excel to CSV conversion failed:', error);
    throw new Error(`Excel转CSV失败: ${error.message}`);
  }
};

// CSV转Excel
export const convertCsvToExcel = async (file) => {
  try {
    const text = await file.text();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(
      text.split('\n').map(row => row.split(','))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return new File([blob], `${file.name.split('.')[0]}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  } catch (error) {
    console.error('CSV to Excel conversion failed:', error);
    throw new Error(`CSV转Excel失败: ${error.message}`);
  }
};

// 文本文件转HTML
export const convertTextToHtml = async (file) => {
  try {
    const text = await file.text();
    const lines = text.split('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${file.name}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 40px;
            line-height: 1.6;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          .line-numbers {
            background: #f1f3f4;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
          }
          .line {
            margin: 0;
            padding: 2px 0;
          }
          .line-number {
            color: #666;
            margin-right: 15px;
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📄 文本文件: ${file.name}</h1>
          <div class="line-numbers">
            ${lines.map((line, index) =>
              `<div class="line"><span class="line-number">${(index + 1).toString().padStart(3, ' ')}:</span>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
            ).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return new File([blob], `${file.name.split('.')[0]}.html`, { type: 'text/html' });
  } catch (error) {
    console.error('Text to HTML conversion failed:', error);
    throw new Error(`文本转HTML失败: ${error.message}`);
  }
};

// HTML转PDF
export const convertHtmlToPdf = async (file) => {
  try {
    const text = await file.text();

    // 创建一个临时的div来渲染HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

    // 使用html2canvas转换为图片，然后生成PDF
    const canvas = await html2canvas(tempDiv, {
      width: 800,
      height: tempDiv.scrollHeight,
      scale: 2, // 提高分辨率
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBlob = pdf.output('blob');
    return new File([pdfBlob], `${file.name.split('.')[0]}.pdf`, { type: 'application/pdf' });
  } catch (error) {
    console.error('HTML to PDF conversion failed:', error);
    throw new Error(`HTML转PDF失败: ${error.message}`);
  }
};

// 图片格式转换
export const convertImageFormat = async (file, targetFormat) => {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // 如果转换为JPG，设置白色背景
        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
        const quality = targetFormat === 'png' ? 1.0 : 0.95;

        canvas.toBlob((blob) => {
          const convertedFile = new File([blob], `${file.name.split('.')[0]}.${targetFormat}`, {
            type: mimeType
          });
          resolve(convertedFile);
        }, mimeType, quality);
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('Image format conversion failed:', error);
    throw new Error(`图片格式转换失败: ${error.message}`);
  }
};

// 图片转PDF
export const convertImageToPdf = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const pdf = new jsPDF();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 计算适合A4页面的尺寸
        const maxWidth = 190; // A4宽度减去边距
        const maxHeight = 270; // A4高度减去边距

        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // 居中放置图片
        const x = (210 - width) / 2;
        const y = (297 - height) / 2;

        pdf.addImage(imgData, 'JPEG', x, y, width, height);

        const pdfBlob = pdf.output('blob');
        const convertedFile = new File([pdfBlob], `${file.name.split('.')[0]}.pdf`, {
          type: 'application/pdf'
        });
        resolve(convertedFile);
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('Image to PDF conversion failed:', error);
    throw new Error(`图片转PDF失败: ${error.message}`);
  }
};

// 通用转换函数
export const convertFile = async (file, targetFormat) => {
  const sourceExtension = file.name.split('.').pop().toLowerCase();

  try {
    switch (`${sourceExtension}->${targetFormat}`) {
      // PDF转换
      case 'pdf->png':
      case 'pdf->jpg':
      case 'pdf->jpeg':
        return await convertPdfToImage(file, targetFormat);

      case 'pdf->txt':
        return await convertPdfToText(file);

      // Word文档转换
      case 'doc->html':
      case 'docx->html':
        return await convertWordToHtml(file);

      // Excel转换
      case 'xls->html':
      case 'xlsx->html':
        return await convertExcelToHtml(file);

      case 'xls->csv':
      case 'xlsx->csv':
        return await convertExcelToCsv(file);

      // CSV转换
      case 'csv->xlsx':
        return await convertCsvToExcel(file);

      // 文本文件转换
      case 'txt->html':
        return await convertTextToHtml(file);

      // HTML转换
      case 'html->pdf':
        return await convertHtmlToPdf(file);

      // 图片转换
      case 'png->pdf':
      case 'jpg->pdf':
      case 'jpeg->pdf':
      case 'gif->pdf':
      case 'bmp->pdf':
      case 'webp->pdf':
        return await convertImageToPdf(file);

      // 图片格式转换
      case 'png->jpg':
      case 'png->jpeg':
      case 'jpg->png':
      case 'jpeg->png':
      case 'gif->png':
      case 'gif->jpg':
      case 'bmp->png':
      case 'bmp->jpg':
      case 'webp->png':
      case 'webp->jpg':
        return await convertImageFormat(file, targetFormat);

      default:
        throw new Error(`不支持的转换类型: ${sourceExtension} -> ${targetFormat}`);
    }
  } catch (error) {
    console.error('File conversion failed:', error);
    throw error;
  }
};



// 获取支持的转换格式
export const getSupportedConversions = () => {
  return {
    pdf: ['png', 'jpg', 'jpeg', 'txt'],
    doc: ['html'],
    docx: ['html'],
    xls: ['html', 'csv'],
    xlsx: ['html', 'csv'],
    csv: ['xlsx'],
    txt: ['html'],
    html: ['pdf'],
    png: ['pdf', 'jpg', 'jpeg'],
    jpg: ['pdf', 'png'],
    jpeg: ['pdf', 'png'],
    gif: ['pdf', 'png', 'jpg'],
    bmp: ['pdf', 'png', 'jpg'],
    webp: ['pdf', 'png', 'jpg']
  };
};

// 检查转换是否支持
export const isConversionSupported = (sourceFormat, targetFormat) => {
  const conversions = getSupportedConversions();
  return conversions[sourceFormat]?.includes(targetFormat) || false;
};

// 获取文件大小的可读格式
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 验证文件类型
export const validateFileType = (file, allowedTypes) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
};
