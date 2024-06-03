import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

export class Embedder {
    private model: HuggingFaceTransformersEmbeddings;
    constructor() {
        this.model = new HuggingFaceTransformersEmbeddings({
            model: "Xenova/all-MiniLM-L6-v2",
        });
    }

    async turnQuery(query: string): Promise<number[]> {
        const res = await this.model.embedQuery(
            query
        );

        return res
    }

    async turnDocs(docs: string[]): Promise<number[][]> {
        const res = await this.model.embedDocuments(
            docs
        );

        return res
    }
}

const embedder = new Embedder()

export default embedder;