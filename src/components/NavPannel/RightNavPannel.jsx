import React from 'react'
import UserImage from "./EmptyUser.png"
import YTPlanner from "./YouTubePlanrIcon.png"

const RightNavPannel = () => {

  function goToChannel(){
    console.log("Opening Channel")
  }

  return (
    <div id="tNav">
      <img src={YTPlanner} style={{height: '80%', width: 'auto', marginRight: 'auto', userSelect: 'none'}}></img>
      <img src={UserImage} onClick={goToChannel} style={{height: '100%', width: 'auto', userSelect: 'none'}}></img>
    </div>
  )
}

export default RightNavPannel