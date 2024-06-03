"use client"
import { Button } from "antd";
import React, { useContext, useRef, useState } from "react";
const validator = require('validator');

interface AddProps {
  addNewFile: any;
  extensions: string[];
  addWebURL: any;
}

const AddFile = ({ addNewFile, addWebURL, extensions }: AddProps) => {
  const [url, seturl] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitWebURL = (e: any) => {
    e.preventDefault()
    seturl("")
    addWebURL(url)
  }

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addNewFile(files[0]); // Assuming you want to add the first selected file
    }
  };

  return (
    <>
        {/* <form onSubmit={handleSubmitWebURL} className="flex justify-center items-center">
          <input type="text" value={url} onChange={(e) => { seturl(e.target.value) }} className={`mb-[20px] border p-[10px] focus:outline-none text-gray-500 font-bold`} placeholder="Enter web url" />
          <button type="submit"
            className="mb-[20px] border p-[10px] text-gray-500 font-bold"
          >
            Submit
          </button>
        </form> */}
      <div className="flex justify-center items-center w-full">
        <Button
          size="large"
          className="my-[20px]"
          onClick={openChooseFile}
        >
          Add file (PDF, TXT)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={extensions.join(",")}
          onChange={handleChangeFile}
        />
      </div>
    </>
  );
};

export default AddFile;
