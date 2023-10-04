import React, {useState} from 'react'
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';


const FloatInputArea = ({type="text", placeholder="text",maxCharCount=100}) => {
    const [redOutlines, setRedOutlines] = useState(false)
    const [wordCount,setWordCount] = useState(0);
    return (
        <>
          <FloatingLabel style={{width: '100%', height: '100%'}} id={redOutlines ? "RED" : "BLK"} controlId={"floatingInput"} label={placeholder + ((wordCount > 0 && maxCharCount > 0) ? (" ("+wordCount+"/"+maxCharCount+")") : "")}>
            <Form.Control style={{width: '100%', height: '100%'}} as="textarea" type={type} placeholder={placeholder} onInput={(text) => {
                if(maxCharCount > 0){
                  setRedOutlines(text.target.value.length > maxCharCount);
                  setWordCount(text.target.value.length);
                }
            }}/>
          </FloatingLabel>
        </>
    );
}

export default FloatInputArea