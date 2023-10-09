import React, {forwardRef, useRef, useState} from 'react'
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';


const FloatInputField = forwardRef(({type="text", placeholder="text",maxCharCount=100,onChangeEvent,ID}, forwardedRef) => {
    const [redOutlines, setRedOutlines] = useState(false)
    const [wordCount,setWordCount] = useState(0);

    return (
        <>
          <FloatingLabel style={{width: '100%', height: '100%'}} id={redOutlines ? "RED" : "BLK"} controlId={"floatingInput" + ID} label={placeholder + (wordCount > 0 ? (" ("+wordCount+"/"+maxCharCount+")") : "")}>
            <Form.Control ref={forwardedRef} style={{width: '100%', height: '100%'}} type={type} placeholder={placeholder} onInput={(text) => {
                setRedOutlines(text.target.value.length > maxCharCount);
                setWordCount(text.target.value.length);
                onChangeEvent(text.target.value);
                //console.log("> " + text.target.value.length + "/" + maxCharCount + " _ " + (redOutlines ? " YES." : " NO!"));
            }}/>
          </FloatingLabel>
        </>
    );
});

export default FloatInputField