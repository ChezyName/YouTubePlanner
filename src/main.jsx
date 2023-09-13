import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="321741293149-uuerbve2dop1ahnnhov8v7mgbmbocnrb.apps.googleusercontent.com">
      <App clientID="321741293149-uuerbve2dop1ahnnhov8v7mgbmbocnrb.apps.googleusercontent.com"
      APIKey="AIzaSyCR3L1ueWZCMdW1QiRAp1VbClx9EgQW-0g"/>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
