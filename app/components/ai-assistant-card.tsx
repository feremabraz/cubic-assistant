"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	isAIThinkingAtom,
	isTalkingAtom,
	showResponseDebugAtom,
} from "@/lib/atoms";
import { useAtom } from "jotai";
import { Bot, Send } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { generateSpeechDirect } from "../actions/generate-speech-direct";

const RESPONSES = [
	"I specialize in crafting performant solutions that bridge frontend experiences with backend systems.",
	"You might find our blog post on React 19 Server Components helpful for understanding this implementation.",
	"This project demonstrates the power of Jotai for state management across complex 3D applications.",
	"Consider exploring our documentation on Three.js integration with React for more insights.",
	"The character animation system uses a custom state machine powered by Jotai atoms.",
	"Our team has written extensively about WebGL performance optimization techniques.",
	"The audio synthesis is handled through OpenAI's TTS API with custom voice parameters.",
	"Check out our latest blog post about Tailwind v4 integration with 3D interfaces.",
	"This implementation leverages React Query for efficient data fetching and caching.",
	"We've documented our approach to responsive 3D design in our technical blog.",
];

function rephraseResponse(originalResponse: string, query: string): string {
	const prefixes = [
		"Based on your question, ",
		"To answer that, ",
		"I'd say that ",
		"From my perspective, ",
		"Looking at this technically, ",
		"In response to your inquiry, ",
		"Considering what you're asking, ",
		"If I understand correctly, ",
	];

	const suffixes = [
		" Does that help with what you're looking for?",
		" Would you like more information on this topic?",
		" Is there a specific aspect you'd like me to elaborate on?",
		" Feel free to ask for more details if needed.",
		" Let me know if you need clarification.",
		" I hope that addresses your question.",
		"",
	];

	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

	return `${prefix}${originalResponse}${suffix}`;
}

function selectResponse(query: string): string {
	const normalizedQuery = query.toLowerCase().trim();

	if (
		normalizedQuery.includes("what are we") ||
		normalizedQuery.includes("who are you") ||
		normalizedQuery.includes("what do you do")
	) {
		return RESPONSES[0];
	}

	// For other queries, select a relevant response
	let responseIndex = 1; // Default to the second response

	if (
		normalizedQuery.includes("react") ||
		normalizedQuery.includes("component")
	) {
		responseIndex = 1;
	} else if (
		normalizedQuery.includes("state") ||
		normalizedQuery.includes("jotai")
	) {
		responseIndex = 2;
	} else if (
		normalizedQuery.includes("three") ||
		normalizedQuery.includes("3d")
	) {
		responseIndex = 3;
	} else if (
		normalizedQuery.includes("animation") ||
		normalizedQuery.includes("character")
	) {
		responseIndex = 4;
	} else if (
		normalizedQuery.includes("performance") ||
		normalizedQuery.includes("webgl")
	) {
		responseIndex = 5;
	} else if (
		normalizedQuery.includes("audio") ||
		normalizedQuery.includes("speech")
	) {
		responseIndex = 6;
	} else if (
		normalizedQuery.includes("tailwind") ||
		normalizedQuery.includes("css")
	) {
		responseIndex = 7;
	} else if (
		normalizedQuery.includes("data") ||
		normalizedQuery.includes("fetch")
	) {
		responseIndex = 8;
	} else if (
		normalizedQuery.includes("design") ||
		normalizedQuery.includes("responsive")
	) {
		responseIndex = 9;
	} else {
		// If no specific match, select a random response (excluding the first one)
		responseIndex = 1 + Math.floor(Math.random() * (RESPONSES.length - 1));
	}

	return rephraseResponse(RESPONSES[responseIndex], query);
}

// Helper function to generate WebVTT caption from text
function generateCaptionUrl(text: string): string {
	// Create a simple WebVTT caption file
	const vttContent = `WEBVTT

1
00:00:00.000 --> 00:02:00.000
${text}`;

	// Create a blob and URL for the VTT content
	const blob = new Blob([vttContent], { type: "text/vtt" });
	return URL.createObjectURL(blob);
}

export function AIAssistantCard() {
	const [query, setQuery] = useState("");
	const [response, setResponse] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [captionUrl, setCaptionUrl] = useState<string | null>(null);
	const [isTalking, setIsTalking] = useAtom(isTalkingAtom);
	const [isAIThinking, setIsAIThinking] = useAtom(isAIThinkingAtom);
	const [error, setError] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	// Add the state for the new atom
	const [showResponseDebug] = useAtom(showResponseDebugAtom);

	// Set up event listeners for the audio element
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlePlay = () => setIsTalking(true);
		const handlePause = () => setIsTalking(false);
		const handleEnded = () => setIsTalking(false);
		const handleError = (e: Event) => {
			console.error("Audio error:", e);
			setError("Error playing audio");
			setIsTalking(false);
		};

		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);

			// Clean up blob URLs
			if (audioUrl && !audioUrl.startsWith("data:")) {
				URL.revokeObjectURL(audioUrl);
			}
			if (captionUrl) {
				URL.revokeObjectURL(captionUrl);
			}
		};
	}, [audioUrl, captionUrl, setIsTalking]);

	// For testing: toggle thinking state when clicking on the card header
	const toggleThinking = () => {
		setIsAIThinking(!isAIThinking);
		console.log("Manually toggled thinking state to:", !isAIThinking);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!query.trim()) return;

		// Start the thinking state
		setIsLoading(true);
		setIsAIThinking(true);
		console.log("Setting thinking state to TRUE");
		setError(null);
		setResponse(null); // Clear previous response

		try {
			// Generate a response based on the query
			const aiResponse = selectResponse(query);

			// End thinking state and show response
			console.log("Setting thinking state to FALSE");
			setIsAIThinking(false);
			setResponse(aiResponse);

			// Generate speech for the response
			const speechResponse = await generateSpeechDirect(aiResponse, "nova");

			if (!speechResponse || !speechResponse.audioBase64) {
				throw new Error("No audio data received from server");
			}

			const { audioBase64 } = speechResponse;

			// Create a data URL directly
			const dataUrl = `data:audio/mp3;base64,${audioBase64}`;
			setAudioUrl(dataUrl);

			// Generate caption URL from the response text
			const captionDataUrl = generateCaptionUrl(aiResponse);
			setCaptionUrl(captionDataUrl);

			// Set the audio source and play
			if (audioRef.current) {
				audioRef.current.src = dataUrl;

				// Add a small delay to ensure the audio is loaded
				setTimeout(() => {
					if (audioRef.current) {
						const playPromise = audioRef.current.play();

						if (playPromise !== undefined) {
							playPromise.catch((err) => {
								console.error("Error playing audio:", err);
								setError(`Error playing audio: ${err.message}`);
							});
						}
					}
				}, 300);
			}
		} catch (error) {
			console.error("Error:", error);
			setError(
				error instanceof Error ? error.message : "Failed to generate response",
			);
			setIsAIThinking(false); // Make sure to turn off thinking state on error
			console.log("Setting thinking state to FALSE (error case)");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto bg-neutral-800 text-gray-200">
			<CardHeader
				className="flex flex-row items-center gap-2 cursor-pointer"
				onClick={toggleThinking}
				title="Click to toggle thinking state (debug)"
			>
				<Bot className="h-5 w-5" />
				<CardTitle>AI Assistant</CardTitle>
			</CardHeader>
			<CardContent>
				{response && showResponseDebug && (
					<div className="mb-4 p-3 bg-neutral-700 rounded-md">
						<p className="text-gray-200">{response}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<Textarea
						placeholder="Ask me about this project..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="min-h-16 bg-neutral-700 border-neutral-600 placeholder:text-neutral-400"
					/>

					{error && (
						<div className="text-red-400 text-sm p-2 bg-red-950/30 rounded border border-red-800">
							{error}
						</div>
					)}

					<Button
						type="submit"
						disabled={isLoading || !query.trim()}
						className="w-full bg-primary hover:bg-primary/90"
					>
						{isLoading ? (
							"Processing..."
						) : (
							<>
								Send
								<Send className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</form>

				{/* Hidden audio element with caption track for accessibility */}
				<audio ref={audioRef} className="hidden">
					<track
						kind="captions"
						src={
							captionUrl ||
							"data:text/vtt,WEBVTT%0A%0A1%0A00:00:00.000%20--%3E%2000:02:00.000%0ANo%20audio%20playing"
						}
						label="English captions"
						srcLang="en"
						default
					/>
					Your browser does not support the audio element.
				</audio>
			</CardContent>
		</Card>
	);
}
