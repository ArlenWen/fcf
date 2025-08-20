import * as pdfjsLib from 'pdfjs-dist';

// 配置PDF.js worker - 使用本地文件避免CDN和CORS问题
// 这个配置会被所有使用PDF.js的组件共享，避免冲突
const configurePdfWorker = () => {
  // 只配置一次，避免重复设置
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
    console.log('PDF.js worker configured with local file:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  }
};

// 立即配置worker
configurePdfWorker();

// 导出pdfjsLib以供其他模块使用
export { pdfjsLib };
export default configurePdfWorker;
