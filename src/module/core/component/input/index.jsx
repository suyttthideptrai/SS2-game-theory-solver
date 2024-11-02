import React from 'react';
import InputHint from '../InputHint';
import "./style.scss";
import { useState } from 'react';

export default function Input({ type, message, error, handleOnChange, value, description, guideSectionIndex }) {
    // const playerHolder = error ? message: message;
    const style = error ? "error" : "";
    const [showHint, setShowHint] = useState(false);

    const handleMouseOver = () => {
        setShowHint(true);
    }

    const handleMouseLeave = () => {
        setShowHint(false)
    }
    
    return (
        <>
            <div className={`input ${style}`}>
                {type === "text" ?
                    <input type="text" placeholder={message} onChange={handleOnChange} value={value} /> :
                    <input type="number" placeholder={message} onChange={handleOnChange} value={value} min={1} />
                }
                <i className="info fa-solid fa-info" onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}></i>
                <InputHint showHint={showHint} setShowHint={setShowHint} heading={message} guideSectionIndex={guideSectionIndex} description={description} />
            </div>
        </>
    )
}