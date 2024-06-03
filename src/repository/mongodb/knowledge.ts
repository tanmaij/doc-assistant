import dbConnect from "@/lib/mongoose";
import KnowledgeModel, { Knowledge, transformList } from "@/model/knowledge";

export class KnowledgeRepository {
    async add(knowledge: Knowledge) {
        await dbConnect();
        const rs=await KnowledgeModel.create(knowledge);
        return rs
    }

    async get(){
        await dbConnect();
        const found = await KnowledgeModel.find()
        return transformList(found)
    }
}

const knowledgeRepository = new KnowledgeRepository()

export default knowledgeRepository;