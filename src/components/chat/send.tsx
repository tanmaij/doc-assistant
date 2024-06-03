"use client"
import { Button, Input } from "antd";
import React, { memo, useContext, useRef, FormEvent, useState } from "react";

interface SendProps{
  addNewMessage: any;
}

const Send = ({ addNewMessage } : SendProps) => {
  const [msg, setMsg] = useState<string>("")

  const send = (e: FormEvent) => {
    e.preventDefault();
    setMsg("")
    addNewMessage(msg)
  };

  return (
    <div>
      <form onSubmit={send} className="flex items-center">
        <Input
          type="text"
          name="content"
          className="text-xl m-5"
          placeholder="Enter message" 
          value={msg}
          onChange={(e)=>{setMsg(e.target.value)}}
          />
      </form>
    </div>
  );
};

export default memo(Send);
