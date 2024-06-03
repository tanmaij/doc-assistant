import dbConnect from "@/lib/mongoose";
import ConversationModel, { Conversation, Message, transform } from "@/model/conversation";
import { Mongoose } from "mongoose";

export class ConversationRepository {
    async addMsgs(userArgent: string, messages: Message[]) {
        await dbConnect();
        await ConversationModel.updateOne({ userArgent: userArgent }, { $push: { messages: { $each: messages } } })
    }

    async getByUserArgent(userArgent: string){
        await dbConnect();
        const found = await ConversationModel.findOne({userArgent: userArgent});
        if(found)
            return transform(found)

    }

    async add(conv: Conversation): Promise<Conversation>{
        await dbConnect();
        return await ConversationModel.create(conv)
    }
}

const conversationRepository = new ConversationRepository()

export default conversationRepository;