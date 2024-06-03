'use client'
import Chat from "@/components/chat";
import File from "@/components/file";
import { File as BufferFile } from "buffer";
import { addKnowledgeByFile, getMsgs, getKnowledges, chat, addKnowledgeByWebURL } from "./action";
import { useEffect, useState } from "react";
import validator from "validator";
import { message } from 'antd';

export default function Page() {
  const [msgs, setMsgs] = useState<{ role: string; content: string; }[]>([])
  const [files, setFiles] = useState<{ name: string; content: string }[]>([])

  const openNotificationError = (msg: string) => {
    message.error(msg)
  };

  const openNotificationSuccess = (msg: string) => {
    message.success(msg)
  };

  useEffect(() => {
    getKnowledges().then((rs) => {
      setFiles(rs)
    }).catch(() => openNotificationError("Something went wrong"))

    getMsgs(window.navigator.userAgent).then((rs) => {
      setMsgs(rs)
    }).catch(() => openNotificationError("Something went wrong"))
  }, [])

  const saveData = async (file: BufferFile) => {
    try {
      if (file.size > 10240000) {
        openNotificationError("Please upload the file that has size below 10MB")
        return
      }

      if (file.size < 0) {
        openNotificationError("Please upload the file that has size below 10MB")
        return
      }

      const formData = new FormData();
      formData.set(`file`, file as Blob);
      formData.set(`extension`, file.type);
      formData.set(`name`, file.name);

      await addKnowledgeByFile(formData)
      const files = await getKnowledges()
      setFiles(files)
      openNotificationSuccess("Add file successfully")
    } catch (err) {
      openNotificationError("Something went wrong")
    }
  }

  const saveWebURL = async (url: string) => {
    if (!validator.isURL(url)) {
      openNotificationError("Invalid URL")
      return
    }

    try {
      await addKnowledgeByWebURL(url)
    } catch {
      openNotificationError("Something went wrong")
    }
  }

  const chatFn = async (content: string) => {
    if(content === ""){
      openNotificationError("The content is empty")
      return
    }

    setMsgs([...msgs, { role: "user", content: content }])
    try {
      const rs = await chat(window.navigator.userAgent, content)
      setMsgs([...msgs, { role: "user", content: content }, { role: "assistant", content: rs }])
    } catch {
      openNotificationError("Something went wrong")
    }
  }

  return (
    <>
    <div className="flex w-screen h-screen bg-slate-300">
      <File saveWebURL={saveWebURL} files={files} extensions={[".pdf", ".txt"]} saveData={saveData} />
      <Chat chatFn={chatFn} msgs={msgs} />
    </div>
    </>
  );
}
