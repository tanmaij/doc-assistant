import OpenAI from "openai/index.mjs";
import mongoose from "mongoose";

export type Knowledge = {
    _id?: string;
    name: string;
    content: string;
};

const schema = new mongoose.Schema<Knowledge>({
    name: String,
    content: String,
});

const KnowledgeModel = mongoose.models.Knowledge || mongoose.model<Knowledge>('Knowledge', schema);

export function transform(model: any): Knowledge {
    const item: Knowledge = {
        name: model.name,content: model.content,
    };

    if (model._id instanceof mongoose.Types.ObjectId) {
        item._id = model._id.toString();
        item.name = model.name;
        item.content = model.content;
    }

    return item;
}

export function transformList(m: any[]): Knowledge[]{
    return m.map((conv)=>{
        return transform(conv)
    })
}


export default KnowledgeModel;
