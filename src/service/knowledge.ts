
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import embedder from "@/lib/embedder";
import chunkVectorRepository, { ChunkVectorRepository } from "@/repository/qdrant/chunk";
import knowledgeRepository, { KnowledgeRepository } from "@/repository/mongodb/knowledge";
import OpenAi from 'openai/index.mjs';
import openai from '@/lib/openai';

export class KnowledgeService {
    chunkVectorRepo: ChunkVectorRepository;
    knowledgeRepo: KnowledgeRepository;
    openAIClient: OpenAi;

    constructor(chunkVectorRepo: ChunkVectorRepository = chunkVectorRepository, knowledgeRepo: KnowledgeRepository = knowledgeRepository, openAICl: OpenAi = openai) {
        this.chunkVectorRepo = chunkVectorRepo
        this.knowledgeRepo= knowledgeRepo
        this.openAIClient= openAICl
    }

    async addKnowledgeByPDFFile(blob: Blob, name: string) {
        const loader = new PDFLoader(blob, {
            splitPages: false,
        });

        const docs = await loader.load();
        const summary = await this.summarizeTextByOpenAI(docs.map(doc=>doc.pageContent).join(
            " "
        ))

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1024,
            chunkOverlap: 64,
        });

        const splitDocs = await textSplitter.splitDocuments(docs);
        const chunks = splitDocs.map(doc => doc.pageContent)
        const embeddings = await embedder.turnDocs(chunks)

        const kl = await this.knowledgeRepo.add({name: name, content:summary})

        await this.chunkVectorRepo.saveEmbeddedChunks(embeddings.map((em, idx) => {
            return { knowledge_id: kl._id?.toString() || "",chunk: chunks[idx], embedding: em }
        }))
    }

    async addKnowledgeByTXTFile(blob: Blob, name: string) {
        const loader = new TextLoader(blob);

        const docs = await loader.load();
        const summary = await this.summarizeTextByOpenAI(docs.map(doc=>doc.pageContent).join(
            " "
        ))

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1024,
            chunkOverlap: 64,
        });

        const splitDocs = await textSplitter.splitDocuments(docs);
        const chunks = splitDocs.map(doc => doc.pageContent)
        const embeddings = await embedder.turnDocs(chunks)

        const kl = await this.knowledgeRepo.add({name: name, content:summary})

        await this.chunkVectorRepo.saveEmbeddedChunks(embeddings.map((em, idx) => {
            return { knowledge_id: kl._id?.toString() || "",chunk: chunks[idx], embedding: em }
        }))
    }


    async addByWebURL(url: string, title: string) {
        // console.info("Loading docs: ", title)
        // const loader = new CheerioWebBaseLoader(url);
        // const docs = await loader.load();
        // const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
        // const transformer = new HtmlToTextTransformer();
        // const sequence = splitter.pipe(transformer);
        // const newDocuments = await sequence.invoke(docs);

        // console.info("Getting summarization of docs: ", newDocuments.map(doc=>doc.pageContent).join(""))
        // const model = new OpenAI({ modelName:"gpt-4o", temperature: 0.2 });
        // const chain = loadSummarizationChain(model, { type: "map_reduce" });
        // const res = await chain.invoke({
        //     input_documents: newDocuments,
        // });
        // const summarization = res.text

        // console.info("Turning docs:", summarization);
        // const textSplitter = new RecursiveCharacterTextSplitter({
        //     chunkSize: 1024,
        //     chunkOverlap: 64,
        // });
        // const splitDocs = await textSplitter.splitDocuments(newDocuments);
        // const chunks = splitDocs.map(doc => doc.pageContent)
        // const embeddings = await embedder.turnDocs(chunks)

        // console.info("Saving doc:", title);
        // const kl = await this.knowledgeRepo.add({name: title, content: res.summarization})

        // console.info("Saving to vector db...");
        // await this.chunkVectorRepo.saveEmbeddedChunks(embeddings.map((em, idx) => {
        //     return { knowledge_id: kl._id?.toString() || "",chunk: chunks[idx], embedding: em }
        // }))
    }

    async get(): Promise<{ name: string; content: string }[]> {
        const rs = await this.knowledgeRepo.get()
        return rs
    }

    private async summarizeTextByOpenAI(text: string): Promise<string>{
        const res = await this.openAIClient.chat.completions.create({
            messages:[
                {
                    role:"system",
                    content:"You are helpful assistant that help summarize long text"
                },
                {
                    role:"user",
                    content:`Summarize this text in less than 50 words: ${text}`
                }
            ],
            model:"gpt-3.5-turbo-0125"
        })

        return res.choices[0].message.content as string
    }
}

const knowledgeService = new KnowledgeService

export default knowledgeService;