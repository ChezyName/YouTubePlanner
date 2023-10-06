import { useEffect, useState } from 'react';
import { useGoogleLogin, hasGrantedAllScopesGoogle, GoogleLogin } from '@react-oauth/google';
import GoogleDrive from './APIs/GoogleDrive';

import LeftArrow from "./assets/BackArrow.svg"

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatInputField from './components/Other/FloatInputField';
import FloatInputArea from './components/Other/FloatInputArea';
import Spinner from 'react-bootstrap/Spinner';

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
  const [authToken,setAuthToken] = useState("");
  const [mainFileData,setMainFileData] = useState({});
  const [editVideo,setEditVideo] = useState(false);

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

        //CSS Properties for Animations
        window.CSS.registerProperty({
          name: '--subscribers',
          syntax: '<integer>',
          initialValue: data.items[0].statistics.subscriberCount,
          inherits: false,
        })
        window.CSS.registerProperty({
          name: '--views',
          syntax: '<integer>',
          initialValue: data.items[0].statistics.viewCount,
          inherits: false,
        })
        window.CSS.registerProperty({
          name: '--videos',
          syntax: '<integer>',
          initialValue: data.items[0].statistics.videoCount,
          inherits: false,
        })
      }
    })
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
      setAuthToken(tokenResponse.access_token);
      getChannel(tokenResponse);

      GoogleDrive.LoadMainFile(tokenResponse.access_token).then((d) => { console.log(d); setMainFileData(d); })
    },
  }, []);

  function createNewVideo(){
    
  }

  useEffect(() => {
    if(!getLogedIn) login();
  })

  return (
    <>
      <div id="ChannelInfo">
          <div id="ChannelNameIcon">
            <img id="ChannelIcon" src={channelIcon}/>
            <div id="TextHolder">
              <a href={"https://youtube.com/channel/"+channelID} target='_blank' id="ChannelLink">Welcome {channelName}!</a>
              <a href={"https://studio.youtube.com/channel/"+channelID} target='_blank' id="OpenStudio">YouTube Studio</a>
            </div>
          </div>


            <div id="ChannelStatistics">
              <div>
                <div>Subscribers</div>
                <div className='subs'></div>
              </div>

              <div>
                <div>Views</div>
                <div className='views'></div>
              </div>

              <div>
                <div>Videos</div>
                <div className='videos'></div>
              </div>
            </div>
        </div>

        { hasVideos ? <div id="All">

        </div> : <div onClick={() => {setEditVideo(true)}} id="AddVideo"><span>Create your first <u>Video Plan</u>.</span></div>}


        {/** OVERLAY WIDGET / WINDOW TO EDIT VIDEO PLANNER INFORMATION */}

        {!getLogedIn ? <div id="Overlay" style={{objectFit: "contain", backgroundColor: '#1F1F1F', justifyContent: 'center', alignItems: 'center'}}>
          <Spinner style={{width: '6vw', height: '6vw'}} variant='light' animation='border' role="status"/>
        </div> : ""}

        {editVideo ? <div id="OverlayTop">
          <div id="EditNavbar">
            <button id="BackButton" onClick={() => {setEditVideo(false);}}><img src={LeftArrow} style={{filter: 'invert(100%)'}}/></button>
            <button id="videoID" disabled={true}>Video #1</button>
            <button id="SaveButton">SAVE</button>
          </div>
          <div id="Overlay2">
            <div id="ThumbnailTitle">
              <div id="Thumbnail">

              </div>
              <div id="Title"><FloatInputField type='text' placeholder='Title' maxCharCount={70}/></div>
              <div id="Notes"><FloatInputArea type='area' placeholder='Notes' maxCharCount={0}/></div>
            </div>
            <div id="Desciption"><FloatInputArea type='area' placeholder='Description' maxCharCount={5000}/></div>
          </div>
        </div>
        : ""}
    </>
  )
}

export default App
