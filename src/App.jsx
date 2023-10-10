import { useEffect, useState, useRef } from 'react';
import { useGoogleLogin, hasGrantedAllScopesGoogle, GoogleLogin } from '@react-oauth/google';
import GoogleDrive, { UpdateMainFile } from './APIs/GoogleDrive';

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
  const [creatingNewVideo,setCreatingNewVideo] = useState(false);
  const [currentFileChanging,setCurrentFileChanging] = useState({});
  const [fileChaningID,setfileChaningID] = useState("");
  const [allVideoPlans,setAllVideoPlans] = useState([]);

  const titleRef = useRef();
  const descRef = useRef();
  const notesRef = useRef();
  const parentRef = useRef();
  const fileInput = useRef();
  const thumbnailRef = useRef();

  async function setVideoData(videoData){
    //console.log(titleRef.current.value)
    if(titleRef.current) titleRef.current.value = videoData.Title;
    if(notesRef.current) notesRef.current.value = videoData.Notes;
    if(descRef.current) descRef.current.value = videoData.Description;
    if(videoData.Thumbnail != "" && thumbnailRef.current){
      thumbnailRef.current.src = videoData.Thumbnail;
    }
    else if(videoData.ThumbnailID && videoData.Thumbnail.type && thumbnailRef.current){
      let data = await GoogleDrive.LoadBlob(authToken,videoData.ThumbnailID);
      const blobUrl = URL.createObjectURL(data)
      thumbnailRef.current.src = blobUrl;
      
      let newFileChange = currentFileChanging;
      newFileChange.Thumbnail = blobUrl;
      setCurrentFileChanging(newFileChange)
    }
    else if(videoData.ThumbnailID == ""){
      thumbnailRef.current.src = "";
    }
  }

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

      GoogleDrive.LoadMainFile(tokenResponse.access_token).then(async (d) => { 
          console.log(d);
          setMainFileData(d);
          setHasVideos(d.videoCount > 0);
          if(d.videoCount > 0){
            let videoPlans = [];
            for(let i = 0; i < d.activeVideoPlans.length; i++){
              console.log("Loading Up Video Plan #" + i + " - " + d.activeVideoPlans[i]);
              let loadedData = await GoogleDrive.Load(tokenResponse.access_token,d.activeVideoPlans[i]);
              if(loadedData.ThumbnailID){
                let thumbnail = await GoogleDrive.LoadBlob(tokenResponse.access_token,loadedData.ThumbnailID);
                const blobUrl = URL.createObjectURL(thumbnail)
                loadedData.Thumbnail = blobUrl;
              }
              videoPlans.push(
                {
                  id: d.activeVideoPlans[i],
                  data: loadedData,
                }
              )
            }
            console.log("Loaded All Video Plans, Count: " + videoPlans.length);
            setAllVideoPlans(videoPlans);
          }
       })
    },
  }, []);

  async function createNewVideo(){
    if(creatingNewVideo) return;
    setCreatingNewVideo(true);
    let getVideoCount = mainFileData.videoCount + 1;
    console.log("Making #" + getVideoCount + " Video.")

    //Set Video Data
    let newVideo = {
      "VideoNumber": getVideoCount,
      "ThumbnailID": "",

      "Title": "New Video Idea",
      "Description": "",
      "Notes": "",
    }

    //Upload File and get File ID
    let newFileData = await GoogleDrive.UploadPlan(authToken,newVideo,null);

    //Add To mainFileData Video Plan Array {ONLY ID}
    let newVideoID = newFileData.id;
    mainFileData.activeVideoPlans.push(newVideoID);
    mainFileData.videoCount = getVideoCount;
    UpdateMainFile(authToken, mainFileData);

    setVideoData(newVideo);

    //Enable Video Editing
    setCurrentFileChanging(newVideo);
    setfileChaningID(newFileData.id);
    setCreatingNewVideo(false);
    setEditVideo(true);
  }

  async function GetAllVideoPlans(){
    setAllVideoPlans([]);
    let videoPlans = [];
    for(let i = 0; i < mainFileData.activeVideoPlans.length; i++){
      console.log("Loading Up Video Plan #" + i + " - " + mainFileData.activeVideoPlans[i]);
      let loadedData = await GoogleDrive.Load(authToken,mainFileData.activeVideoPlans[i]);
      if(loadedData.ThumbnailID){
        let thumbnail = await GoogleDrive.LoadBlob(authToken,loadedData.ThumbnailID);
        const blobUrl = URL.createObjectURL(thumbnail)
        loadedData.Thumbnail = blobUrl;
      }
      videoPlans.push(
        {
          id: mainFileData.activeVideoPlans[i],
          data: loadedData,
        }
      )
    }
    console.log("Loaded All Video Plans, Count: " + videoPlans.length);
    setAllVideoPlans(videoPlans);
  }

  async function SaveVideo(){
    console.log(currentFileChanging);
    await GoogleDrive.UploadPlan(authToken,currentFileChanging,fileChaningID);
    setEditVideo(false);
    GetAllVideoPlans();
  }

  useEffect(() => {
    if(!getLogedIn) login();
  })

  useEffect(() => {
    parentRef.current.className = editVideo ? "SHOW" : "HIDE";
  }, [editVideo])
  

  const VideoElement = ({id,data}) => {
    return <div onClick={(e) => {
      console.log(data);
      setVideoData(data);
      setCurrentFileChanging(data);
      setfileChaningID(id);
      setEditVideo(true);
    }}>{data.Title}</div>
  }

  document.addEventListener("keydown", function(e) {
    if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      if(editVideo) SaveVideo();
    }
  }, false);

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
          {allVideoPlans.map(VideoElement)}
        </div> : <div onClick={() => {createNewVideo()}} id="AddVideo"><span>Create your first <u>Video Plan</u>.</span></div>}


        {/** OVERLAY WIDGET / WINDOW TO EDIT VIDEO PLANNER INFORMATION */}

        {!getLogedIn ? <div id="Overlay" style={{objectFit: "contain", backgroundColor: '#1F1F1F', justifyContent: 'center', alignItems: 'center'}}>
          <Spinner style={{width: '6vw', height: '6vw'}} variant='light' animation='border' role="status"/>
        </div> : ""}

        <div id="OverlayTop" ref={parentRef} className='HIDE'>
          <div id="EditNavbar">
            <button id="BackButton" onClick={() => {setEditVideo(false);  setCurrentFileChanging({}); setfileChaningID(""); }}><img src={LeftArrow} style={{filter: 'invert(100%)'}}/></button>
            <button id="videoID" disabled={true}>Video #{currentFileChanging.VideoNumber}</button>
            <button id="SaveButton" onClick={SaveVideo}>SAVE</button>
          </div>
          <div id="Overlay2">
            <div id="ThumbnailTitle">
              <input ref={fileInput} className="HIDE" type='file' name={"ImageFile"} accept="image/*" onChange={async (event) => {
                let fileToUpload = event.target.files[0];
                let data = await GoogleDrive.UploadImage(authToken,fileToUpload,currentFileChanging.Title);
                console.log(data);
                let thumbnailID = data.id;
                let newData = currentFileChanging;
                newData.ThumbnailID = thumbnailID;
                if(thumbnailRef.current) {
                  let imageBlob = await GoogleDrive.ImageToBlob(fileToUpload);
                  console.log(imageBlob);
                  //const blobUrl = URL.createObjectURL(imageBlob)
                  thumbnailRef.current.src = imageBlob;
                  
                  let newFileChange = currentFileChanging;
                  newFileChange.Thumbnail = blobUrl;
                  setCurrentFileChanging(newFileChange)
                }
                setCurrentFileChanging(newData);
              }}/>
              <img id="Thumbnail" ref={thumbnailRef} onClick={() => {fileInput.current.click();}}></img>
              <div id="Title"><FloatInputField ref={titleRef} ID="TITLE" onChangeEvent={(t) => {let newData = currentFileChanging; newData.Title = t; setCurrentFileChanging(newData)}} type='text' placeholder='Title' maxCharCount={70}/></div>
              <div id="Notes"><FloatInputArea ref={notesRef} ID="NOTES" onChangeEvent={(t) => {let newData = currentFileChanging; newData.Notes = t; setCurrentFileChanging(newData)}} type='area' placeholder='Notes' maxCharCount={0}/></div>
            </div>
            <div id="Desciption"><FloatInputArea ref={descRef} ID="DESC" onChangeEvent={(t) => {let newData = currentFileChanging; newData.Description = t; setCurrentFileChanging(newData)}} type='area' placeholder='Description' maxCharCount={5000}/></div>
          </div>
        </div>
    </>
  )
}

export default App
