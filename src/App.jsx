import { useEffect, useState } from 'react';
import './App.css'
import { useGoogleLogin, hasGrantedAllScopesGoogle, GoogleLogin } from '@react-oauth/google';

function App({clientID, APIKey}) {
  const [getID, setID] = useState(null)
  const [getLogedIn, setLogedIn] = useState(false)
  const [getData,setData] = useState({});

  //YouTubeStuff
  const [channelID, setChannelID] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [channelName, setChannelname] = useState("");
  const [channelIcon, setChannelIcon] = useState("");
  const [Subscribers, setSubscribers] = useState("");
  const [VideoCount, setVideoCount] = useState("");
  const [ViewCount, setViewCount] = useState("");

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
        setVideoCount(data.items[0].statistics.videoCount);
        setViewCount(data.items[0].statistics.viewCount);
        setChannelLink("" + data.items[0].snippet.customUrl);
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
    if(!getLogedIn) login();
  })

  return (
    <>
      <div id="ChannelInfo">
        <div id="ChannelNameIcon">
          <img id="ChannelIcon" src={channelIcon}/>
          <div id="TextHolder">
            <a href={"https://youtube.com/channel/"+channelID} target='_blank' id="ChannelLink">{channelName}</a>
            <a href={"https://studio.youtube.com/channel/"+channelID} target='_blank' id="OpenStudio">YouTube Studio</a>
          </div>
        </div>
          <div id="ChannelStatistics">
            <div>
              <div>Subscribers</div>
              <div>{Subscribers}</div>
            </div>

            <div>
              <div>Views</div>
              <div>{ViewCount}</div>
            </div>

            <div>
              <div>Videos</div>
              <div>{VideoCount}</div>
            </div>
          </div>
      </div>
    </>
  )
}

export default App
