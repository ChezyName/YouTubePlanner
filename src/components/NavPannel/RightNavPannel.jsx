import React from 'react'
import UserImage from "./EmptyUser.png"

const RightNavPannel = () => {
  return (
    <div id="rNav">
        <div id="userInfo" style={{height: "8%", borderBottom: "6px solid #141414", display: 'flex'}}>
            <img style={{height: "100%", width: "auto", borderRight: '6px solid #141414'}} src={UserImage}></img>
            <div style={{width: "100%", height:"100%", display: 'grid', justifyContent: 'center', alignContent: 'center'}}>
              <span style={{fontSize: '3vw', whiteSpace: "nowrap", overflow: 'hidden', textOverflow: 'ellipsis'}}>Username</span>
            </div>
        </div>
    </div>
  )
}

export default RightNavPannel