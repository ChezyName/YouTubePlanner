import { useEffect, useState } from 'react';
import './App.css'
import { useGoogleLogin, hasGrantedAllScopesGoogle, GoogleLogin } from '@react-oauth/google';

function App({clientID, APIKey}) {
  const [getID, setID] = useState(null)
  const [getLogedIn, setLogedIn] = useState(false)
  const [getData,setData] = useState({});

  //YouTubeStuff
  const [channelID, setChannelID] = useState("");
  const [channelName, setChannelname] = useState("");
  const [channelIcon, setChannelIcon] = useState("");
  const [Subscribers, setSubscribers] = useState("");

  function getChannel(auth) {
    console.log("Getting Channel Data...");
    fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&mine=true&access_token="+auth.access_token)
    .then(response => {
      return response.json()
    })
    .then(data => {
      setData(data);
      console.log(data)
      if(data.pageInfo.totalResults < 1){
        setLogedIn(false);
        return;
      }
      if(data.items.length > 0){
        setChannelID(data.items[0].id);
        setChannelname(data.items[0].snippet.title);
        setChannelIcon(data.items[0].snippet.thumbnails.high.url);
        setSubscribers(data.items[0].statistics.subscriberCount);
      }
    })
  }


  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/drive.appdata',
    onSuccess: (tokenResponse) => {
      setID(tokenResponse)
      console.log(tokenResponse);
      const hasAccess = hasGrantedAllScopesGoogle(
        tokenResponse,
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/drive.appdata'
      );
      console.log(hasAccess ? "Full Access.." : "Something Not Working...");
      setLogedIn(hasAccess);
      getChannel(tokenResponse);
    },
  }, []);


  useEffect(() => {
    if(!getLogedIn){
      /*
      function GAPIStart(){
        gapi.client.init({
          apiKey: APIKey,
          clientId: clientID,
          scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/drive.appdata"
        })
      }

      gapi.load('client:oauth2',GAPIStart);
      */
      login();
    }
  }, [])

  return (
    <>
      <div id="ChannelInfo">
        <img id="ChannelIcon" src={channelIcon}/>
      </div>
    </>
  )
}

export default App
