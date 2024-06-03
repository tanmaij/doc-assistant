"use client"
import { memo, useState } from "react";
import AddFile from "./add";
import { File as BufferFile } from "buffer";
import { Avatar, List } from "antd";
import pdfLogo from "../../../public/pdf.png"
import txtLogo from "../../../public/txt.png"
import Image from "next/image";

// Define the type for a single file
interface FileType {
  name: string;
  content: string;
}

interface FilesProps {
  saveData: any;
  saveWebURL: any;
  extensions: string[];
  files: FileType[];
}

// Use the defined types in the Files component
const Files = ({ saveData, saveWebURL, extensions, files }: FilesProps) => {
  const addFileFn = async (file: BufferFile): Promise<void> => {
    await saveData(file)
  }

  return (
    <div className="w-[320px] flex flex-col rounded-xl m-10 mr-5 bg-white">
      <div className="rounded-t-xl bg-black text-white p-3 text-2xl shadow-2xl">
        <h2>Files</h2>
      </div>
      <AddFile addWebURL={saveWebURL} addNewFile={addFileFn} extensions={extensions} />
      <List
        itemLayout="horizontal"
        dataSource={files.map(file => {
          return { title: file.name, description: file.content }
        })}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={<Image src={item.title.split(".")[item.title.split(".").length - 1] === "pdf" ? pdfLogo : txtLogo} width={30} height={30} alt="" />} />}
              title={item.title}
              description={item.description.slice(0, 60) + "..."}
              className="mx-3"
            />
          </List.Item>
        )}
      />

    </div>
  );
};

export default memo(Files);
