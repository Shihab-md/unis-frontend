import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import AuthContext from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <AuthContext>
    <div>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <App />
    </div>
  </AuthContext>,
)
