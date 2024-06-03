"use client"
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import Message from "./message";
import Send from "./send";

// Define types for the context values
interface MessageType {
  content: string;
  role: string;
}

// Define the shape of the context
interface ChatProps {
  chatFn: any;
  msgs: MessageType[];
}

const Chat = ({ chatFn, msgs }: ChatProps) => {
  const addNewMessage = (msg: string): void => {
    chatFn(msg)
  }
  
  const msgsID="chatbox-chat"

  useEffect(()=>{
    const element = document.getElementById(msgsID) as HTMLDivElement;
    msgs.length > 0 && element.scrollTo(0, element.scrollHeight);
},[msgs])

  return (
    <div className="flex-1 flex flex-col rounded-xl ml-5 bg-white m-10">
      <div className="rounded-t-xl bg-black text-white p-3 text-2xl shadow-2xl">
        <h2>Chat</h2>
      </div>
      <div id={msgsID} className="flex-1 flex flex-col overflow-y-auto h-full">
        {msgs.map((message, index) => (
          <Message
            key={index}
            message={message.content}
            isAuthor={message.role === "user"}
          />
        ))}
      </div>
      <Send addNewMessage={addNewMessage} />
    </div>
  );
};

export default memo(Chat);
