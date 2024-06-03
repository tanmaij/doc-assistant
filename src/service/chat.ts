import OpenAi from 'openai/index.mjs';
import conversationRepository, { ConversationRepository } from '@/repository/mongodb/conversation';
import chunkVectorRepository, { ChunkVectorRepository } from '@/repository/qdrant/chunk';
import openai from '@/lib/openai';
import embedderInstance, { Embedder } from '@/lib/embedder';
import knowledgeRepository, { KnowledgeRepository } from '@/repository/mongodb/knowledge';

interface SematicSearchToolParams {
  knowledge_ids: string[]
  question: string
}

export class ChatService {
  private openaiClient: OpenAi;
  private conversationRepo: ConversationRepository;
  private chunkVectorRepo: ChunkVectorRepository;
  private embedder: Embedder;
  private instructionMsg: string;
  private knowledgeRepo: KnowledgeRepository;
  constructor(openaiClient: OpenAi = openai, chunkVectorRepo: ChunkVectorRepository = chunkVectorRepository, conversationRepo = conversationRepository, embedder: Embedder = embedderInstance, knowledgeRepo: KnowledgeRepository = knowledgeRepository) {
    this.openaiClient = openaiClient
    this.chunkVectorRepo = chunkVectorRepo
    this.conversationRepo = conversationRepo
    this.embedder = embedder
    this.instructionMsg = "You are a helpful, cheerful, and humorous assistant answering questions"
    this.knowledgeRepo = knowledgeRepo
  }

  private async excutingTool(toolName: string, params: any): Promise<any> {
    switch (toolName) {
      case "semantic_search":
        const input = params as SematicSearchToolParams
        console.info("Semantic searching", params);
        
        const rs = await this.semanticSearch(input.knowledge_ids, input.question)
        return rs

      default:

    }
  }

  private async semanticSearch(knowledgeIDs: string[], input: string): Promise<string[]> {
    const embedding = await this.embedder.turnQuery(input)
    return await this.chunkVectorRepo.search(knowledgeIDs, embedding, { page: 1, limit: 5 })
  }

  async chat(userArgent: string, message: string): Promise<string> {
    console.info("---------------- Got new message ----------------");
    console.info("Question:", message);

    const kls = await this.knowledgeRepo.get()
    const tools: Array<OpenAi.ChatCompletionTool> = [
      {
        type: "function",
        function: {
          name: "semantic_search",
          description: "Used to search for knowledge that you don't know to handle the request",
          parameters: {
            type: "object",
            properties: {
              knowledge_ids: {
                type: "array",
                description: "The knowledge IDs in the provided list, filter out the appropriate knowledge according to the question",
                items: {
                  type: "string",
                }
              },
              question: {
                type: "string",
                description: "Based on the user's question and the history of questions and previous answers, summarize them and provide the final question with full context for accurate search",
              },
            },
            required: ["question", "knowledge_ids"],
          },
        },
      },
    ] as const;

    let conversation = await this.conversationRepo.getByUserArgent(userArgent)
    if (!conversation) {
      conversation = await this.conversationRepo.add({
        userArgent: userArgent,
        messages: []
      })
    }

    const knowledgesJSON = JSON.stringify(kls.map(kl => { return { id: kl._id?.toString(), title: kl.name, description: kl.content } }))
    const msgs: OpenAi.ChatCompletionMessageParam[] = [
      { role: "system", content: `${this.instructionMsg}. Here are the saved knowledges: ${knowledgesJSON}` }, ...conversation.messages, { role: "user", content: message }
    ]
    const msgsToSave: OpenAi.ChatCompletionMessageParam[] = [{ role: "user", content: message }]

    console.info("Making request:", msgs);
    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: msgs,
      tools: tools,
    })

    const resMsg = response.choices[0].message;
    msgs.push(resMsg);

    if (resMsg.tool_calls) {
      for (const toolCall of resMsg.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const toolRes = await this.excutingTool(functionName, functionArgs);

        msgs.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(toolRes),
        });
      }

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: msgs,
      })

      msgs.push(response.choices[0].message);
    }

    const finalMsg = msgs[msgs.length - 1]
    msgsToSave.push(finalMsg)

    this.conversationRepo.addMsgs(userArgent, msgsToSave)
    console.info("Reply:", finalMsg.content);

    return finalMsg.content as string || ""
  }

  async getMsgs(userArgent: string): Promise<{ role: string, content: string }[]> {
    let conv = await this.conversationRepo.getByUserArgent(userArgent)
    if (!conv) {
      conv = await this.conversationRepo.add({
        userArgent: userArgent,
        messages: []
      })
    }

    const filtered = conv.messages.filter(msg => (msg.role === "assistant" || msg.role === "user") && msg.content)
    return filtered.map(msg => { return { role: msg.role as string, content: msg.content as string } })
  }
}

const chatService = new ChatService()

export default chatService;
