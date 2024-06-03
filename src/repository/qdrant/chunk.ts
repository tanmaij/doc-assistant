import vectorDBClient from "@/lib/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";

const COLLECTION_NAME = "chunk"

export class ChunkVectorRepository{
    qdrantClient: QdrantClient
    constructor(qdrantC: QdrantClient = vectorDBClient){
        this.qdrantClient=qdrantC
    }
    async search(knowledgeIDs: string[],embedding: number[], pag: any): Promise<string[]> {
        const res = await this.qdrantClient.search(COLLECTION_NAME, {
            filter: {
                must: [
                    {
                        key: "knowledge_id",
                        match: {
                          "any": knowledgeIDs
                        }
                    }
                ],
            },
            vector: embedding,
            limit: pag.limit,
        });
        
        return res.map((item: any) => item.payload.chunk);
    }

    async saveEmbeddedChunks(embeddings: {knowledge_id: string, chunk: string, embedding: number[]}[]){
        try{
        await this.ensureCollectionExists();

        await this.qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: embeddings.map(embedding => {
                return { id: uuidv4(), vector: embedding.embedding, payload: { knowledge_id : embedding.knowledge_id,chunk: embedding.chunk }}
            }),
        });}
        catch(err){
            console.log(err);
            
        }
    }

    async ensureCollectionExists() {
        const collections = await this.qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            (collection) => collection.name === COLLECTION_NAME
        );
    
        if (!collectionExists) {
            await this.qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 384,
                    distance: "Cosine",
                },
            });
        }
    }
}

const chunkVectorRepository = new ChunkVectorRepository()

export default chunkVectorRepository;