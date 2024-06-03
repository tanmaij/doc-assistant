'use server'
import chatService from "@/service/chat";
import knowledgeService from "@/service/knowledge";

export async function addKnowledgeByFile(formData: FormData) {
    console.info("Uploading:", formData);

    const file = formData.get("file") as Blob
    const extension = formData.get("extension") as string
    const name = formData.get("name") as string

    switch (extension) {
        case "application/pdf":
            await knowledgeService.addKnowledgeByPDFFile(file, name);
            return

        case "text/plain":
            await knowledgeService.addKnowledgeByTXTFile(file, name);
            return

        default:
            console.error("Unsuported file extension:", extension)
    }
}

export async function addKnowledgeByWebURL(url: string) {
    return await knowledgeService.addByWebURL(url, "")
}

export async function getKnowledges(): Promise<{ name: string; content: string }[]> {
    return await knowledgeService.get()
}

export async function getMsgs(userArgent: string): Promise<{ role: string, content: string }[]> {
    return await chatService.getMsgs(userArgent)
}

export async function chat(userArgent: string, content: string): Promise<string> {
    console.info(userArgent);
    return await chatService.chat(userArgent, content)
}
