import { Telegraf } from 'telegraf'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import dotenv from 'dotenv'
import { message } from 'telegraf/filters'
import { system_instruction as systemInstruction } from './reglamentinfo.js'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

async function runChat() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction });
    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [{ text: "Hola, cual es tu funcionalidad?" }],
            },
            {
                role: "model",
                parts: [{ text: "Hola! Estoy para ayudarte con preguntas relacionadas con la elaboración de trabajos de titulación y proyectos integrador de saberes.  Puedo brindarte información objetiva sobre estos temas, sin añadir subjetividad o recomendaciones. ¿Qué te gustaría saber?" }],
            },
        ],
    });

    bot.start((ctx) => {
        ctx.reply('Hola, soy un ayudante para la elaboración de trabajos de titulación y proyectos integrador de saberes dentro de la UNL, ¿Te gustaría que te ayude con alguna información sobre estos temas?')
    }) 
    bot.on(message('text'), async (ctx) => {
        console.log(ctx.message.text);
        const result = await chat.sendMessage(ctx.message.text);
        const response = result.response;
        console.log(response.text());
        ctx.reply(response.text())
    })

    bot.launch()
}



runChat()
