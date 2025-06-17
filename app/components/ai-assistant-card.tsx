"use client";

import { generateCvResponse } from "@/app/actions/generate-cv-response";
import { generateSpeechDirect } from "@/app/actions/generate-speech-direct";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	isAIThinkingAtom,
	isTalkingAtom,
	showResponseDebugAtom,
} from "@/store/atoms";
import { useAtom } from "jotai";
import { Bot, Send } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

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

export function AIAssistantCard() {
	const [query, setQuery] = useState("");
	const [response, setResponse] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
		};
	}, [audioUrl, setIsTalking]);

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
		setError(null);
		setResponse(null); // Clear previous response

		try {
			// Generate a response based on the query using the new server action
			const rawCvResponse = await generateCvResponse(query);
			const aiResponse = rephraseResponse(rawCvResponse, query); // Still rephrasing for now

			// Show response
			setResponse(aiResponse);

			// Generate speech for the response
			const speechResponse = await generateSpeechDirect(aiResponse, "echo");

			if (!speechResponse || !speechResponse.audioBase64) {
				throw new Error("No audio data received from server");
			}

			const { audioBase64 } = speechResponse;

			// Create a data URL directly
			const dataUrl = `data:audio/mp3;base64,${audioBase64}`;
			setAudioUrl(dataUrl);

			// Set the audio source and play
			if (audioRef.current) {
				audioRef.current.src = dataUrl;

				// Add a small delay to ensure the audio is loaded
				setTimeout(() => {
					if (audioRef.current) {
						// End thinking state
						setIsAIThinking(false);
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
			setIsAIThinking(false);
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

				{/* Hidden audio element */}
				{/* biome-ignore lint/a11y/useMediaCaption: Not needed. */}
				<audio ref={audioRef} className="hidden">
					Your browser does not support the audio element.
				</audio>
			</CardContent>
		</Card>
	);
}
