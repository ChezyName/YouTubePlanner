import { useEffect, useState } from 'react';
import './App.css'
import RightNavPannel from './components/NavPannel/RightNavPannel'
import { useGoogleLogin, hasGrantedAnyScopeGoogle, GoogleLogin } from '@react-oauth/google';
import { gapi, loadAuth2 } from 'gapi-script';

function getChannel(auth) {
  console.log("Getting Channel Data...");
  fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&mine=true&access_token="+auth.access_token)
  .then(response => {
    return response.json()
  })
  .then(data => {
    console.log(data)
  })
}

function App({clientID, APIKey}) {
  const [getID, setID] = useState(null)
  const [getLogedIn, setLogedIn] = useState(false)

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/drive.appdata',
    onSuccess: (tokenResponse) => {
      setID(tokenResponse)
      console.log(tokenResponse);
      const hasAccess = hasGrantedAllScopeGoogle(
        tokenResponse,
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/drive.appdata'
      );
      setLogedIn(hasAccess);
      getChannel(tokenResponse);
    },
  });


  useEffect(() => {
    function GAPIStart(){
      gapi.client.init({
        apiKey: APIKey,
        clientId: clientID,
        scope: "https://www.googleapis.com/auth/youtube.readonly"
      })
    }

    gapi.load('client:oauth2',GAPIStart);
    login();
  })

  return (
    <>
      {/* <RightNavPannel/> */}
    </>
  )
}

export default App
