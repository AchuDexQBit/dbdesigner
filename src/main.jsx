import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LocaleProvider } from '@douyinfe/semi-ui';
import en_US from '@douyinfe/semi-ui/lib/es/locale/source/en_US';
import { UserContextProvider } from './context/UserContext';
import App from './App.jsx';
import './index.css';
import './i18n/i18n.js';

const requiredEnvVars = ['VITE_API_URL', 'VITE_TOOLS_URL'];
requiredEnvVars.forEach((key) => {
  if (!import.meta.env[key]) {
    console.error(`[drawdb] Missing required env var: ${key}`);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserContextProvider>
    <BrowserRouter>
      <LocaleProvider locale={en_US}>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </UserContextProvider>,
);