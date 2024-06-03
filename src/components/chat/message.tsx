"use client"
import React from 'react';
var showdown  = require('showdown');

interface MessageProps {
  message: string;// Assuming appUser is an object with id and name properties
  isAuthor: boolean;
}

const converter = new showdown.Converter()

const Message: React.FC<MessageProps> = ({ message, isAuthor }: MessageProps) => {
  return (
    <div className={`w-full flex ${isAuthor ? "justify-end" : ""}`}>
      <div dangerouslySetInnerHTML={{__html:converter.makeHtml(message)}}
        className={`${isAuthor ? "bg-red-400 text-white mr-10" : "ml-10 bg-slate-100"} border mb-5 py-3 px-5 rounded-2xl prose prose-slate max-w-[60%]`}
      />
    </div>
  );
};

export default Message;
