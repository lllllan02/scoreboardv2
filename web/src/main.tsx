import ReactDOM from 'react-dom/client';
import App from './App';

// 导入全局样式
import './styles/global.css';

// 移除 StrictMode 以避免组件重复挂载和重复API请求
ReactDOM.createRoot(document.getElementById('root')!).render(<App />); 