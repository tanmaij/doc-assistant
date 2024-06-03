import OpenAi from 'openai/index.mjs';

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
