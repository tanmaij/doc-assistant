import OpenAI from "openai/index.mjs";
import mongoose from "mongoose";

export type Message = OpenAI.ChatCompletionMessageParam;

export type Conversation = {
    _id?: string;
    userArgent: string;
    messages: Message[];
};

const schema = new mongoose.Schema<Conversation>({
    userArgent: String,
    messages: Array,
});

const ConversationModel = mongoose.models.Conversation || mongoose.model<Conversation>('Conversation', schema);

export function transform(model: any): Conversation {
    const item: Conversation = {
        userArgent: model.userArgent,
        messages: model.messages,
    };

    if (model._id instanceof mongoose.Types.ObjectId) {
        item._id = model._id.toString();
        item.userArgent = model.userArgent;
        item.messages = model.messages;
    }

    return item;
}

export function transformList(m: any[]): Conversation[]{
    return m.map((conv)=>{
        return transform(conv)
    })
}


export default ConversationModel;
