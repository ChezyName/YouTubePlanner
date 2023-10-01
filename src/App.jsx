import { useEffect, useState } from 'react';
import './App.css'
import { useGoogleLogin, hasGrantedAllScopesGoogle, GoogleLogin } from '@react-oauth/google';
//import request from 'request';

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
  const [hasVideos,setHasVideos] = useState(false);
  const [showOverlay,setShowOverlay] = useState(false);
  const [authToken,setAuthToken] = useState("");

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

  function uploadGoogleDriveData(name, data, fileType, auth){
    return new Promise((resolve,reject) => {
      console.log("Auth Token: ", auth);
      fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=media&supportsAllDrives=true", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        //mode: "no-cors", // no-cors, *cors, same-origin
        //cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/"+fileType,
          "Authorization": 'Bearer ' + auth,
          'name': name,
          'parents': ['appDataFolder']
        },
        //redirect: "follow", // manual, *follow, error
        //referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: {
          data
        }
      }).then((response) => {resolve(response.json())});
    });

    fetch()
  }

  async function getGoogleDriveData(url){

  }


  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
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
      setAuthToken(tokenResponse);
      getChannel(tokenResponse);
      
      /* File Upload Works!
      uploadGoogleDriveData("FirstEverUploadFromJS",JSON.stringify({
        name: "ChezyName",
        shouldYallSubscribe: "Yess",
        shouldYallLike: "HELL YEAH!"
      }),'json', tokenResponse.access_token).then((d) => {console.log(d)})
      */
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

        { hasVideos ? <div id="All">

        </div> : <div id="AddVideo"><span>Create your first <u>Video Plan</u>.</span></div>}


        {/** OVERLAY WIDGET / WINDOW TO EDIT VIDEO PLANNER INFORMATION */}

        {showOverlay ? 
        <div id="Overlay">
          
        </div>
        : ""}
    </>
  )
}

export default App
