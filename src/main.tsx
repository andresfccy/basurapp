import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from './auth/auth-context'
import { ConfigProvider } from './config/config-context'
import { PickupsProvider } from './pickups/pickups-context'
import { NotificationProvider } from './notifications/notification-context'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <ConfigProvider>
          <AuthProvider>
            <PickupsProvider>
              <App />
            </PickupsProvider>
          </AuthProvider>
        </ConfigProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
