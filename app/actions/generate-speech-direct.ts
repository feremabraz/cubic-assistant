"use server";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export async function generateSpeechDirect(
	text: string,
	voice: Voice = "onyx",
): Promise<{ audioBase64: string; duration: number }> {
	try {
		const apiKey = process.env.OPENAI_API_KEY;

		if (!apiKey) {
			throw new Error("OpenAI API key is not configured");
		}

		const response = await fetch("https://api.openai.com/v1/audio/speech", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "tts-1",
				voice,
				input: text,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error("OpenAI API error:", errorData);
			throw new Error(
				`OpenAI API error: ${response.status} ${response.statusText}`,
			);
		}

		const audioArrayBuffer = await response.arrayBuffer();
		const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");
		const wordCount = text.split(/\s+/).length;
		const durationInSeconds = (wordCount / 150) * 60;

		return {
			audioBase64,
			duration: durationInSeconds,
		};
	} catch (error) {
		throw new Error(
			`Failed to generate speech: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
