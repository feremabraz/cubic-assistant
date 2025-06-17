"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";

const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

async function getCVContent(): Promise<string> {
	let cvPath = "";
	try {
		if (process.env.VERCEL_ENV) {
			// Running on Vercel
			cvPath = path.join(process.cwd(), "CV_Fernando_Braz.txt");
		} else {
			// Running locally
			cvPath = path.join(process.cwd(), "public", "CV_Fernando_Braz.txt");
		}
		const cvContent = await fs.readFile(cvPath, "utf-8");
		return cvContent;
	} catch (error) {
		console.error(
			"Error reading CV file:",
			error,
			"Attempted CV Path:",
			cvPath,
		);
		return "Error: Could not load CV information. Please check if the file exists and the server has read permissions.";
	}
}

export async function generateCvResponse(query: string): Promise<string> {
	const cvContent = await getCVContent();

	if (cvContent.startsWith("Error:")) {
		return cvContent;
	}

	const systemPrompt = `You are a helpful AI assistant for Fernando Braz. Your primary role is to answer questions about Fernando's skills, professional experience, and projects based *solely* on the provided CV content. 

When answering, you MUST adhere to the following guidelines:
1.  Speak in the third person when referring to Fernando (e.g., "Fernando has experience in...", "He worked on..."). Do NOT use "I" or "my" when talking about Fernando's experience.
2.  Base all your answers strictly on the information present in the CV below. Do not infer, invent, or use external knowledge.
3.  If the user's question cannot be answered using the CV, politely state that the information is not available in Fernando's CV or that you can only provide answers based on his CV.
4.  Be concise and to the point.
5.  Do not engage in general conversation or answer questions unrelated to Fernando's CV.

Here is Fernando Braz's CV:
---
${cvContent}
---`;

	try {
		const { text } = await generateText({
			model: openai("gpt-4o-mini"),
			system: systemPrompt,
			prompt: query,
		});
		return text;
	} catch (error) {
		console.error("Error generating text with OpenAI:", error);
		return "Error: Could not generate a response from the AI. Please try again later.";
	}
}
