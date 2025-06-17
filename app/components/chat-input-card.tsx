"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isAIThinkingAtom, isTalkingAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { Loader2, Send, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateSpeechDirect } from "../actions/generate-speech-direct";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export function ChatInputCard() {
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [isTalking, setIsTalking] = useAtom(isTalkingAtom);
	const [isAIThinking, setIsAIThinking] = useAtom(isAIThinkingAtom);
	const [voice, setVoice] = useState<Voice>("onyx");
	const [error, setError] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

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

			// Clean up blob URL if it's not a data URL
			if (audioUrl && !audioUrl.startsWith("data:")) {
				URL.revokeObjectURL(audioUrl);
			}
		};
	}, [audioUrl, setIsTalking]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!message.trim()) return;

		setIsLoading(true);
		setIsAIThinking(true);
		setError(null);

		try {
			const response = await generateSpeechDirect(message, voice);

			// Turn off thinking indicator before playing audio
			setIsAIThinking(false);

			if (!response || !response.audioBase64) {
				throw new Error("No audio data received from server");
			}

			const { audioBase64 } = response;

			// Create a data URL directly
			const dataUrl = `data:audio/mp3;base64,${audioBase64}`;
			setAudioUrl(dataUrl);

			// Set the audio source and play
			if (audioRef.current) {
				audioRef.current.src = dataUrl;

				// Log for debugging
				console.log(
					"Audio URL set (first 50 chars):",
					`${dataUrl.substring(0, 50)}...`,
				);
				console.log("Audio element:", audioRef.current);

				// Add a small delay to ensure the audio is loaded
				setTimeout(() => {
					if (audioRef.current) {
						const playPromise = audioRef.current.play();

						if (playPromise !== undefined) {
							playPromise
								.then(() => {
									console.log("Audio playback started successfully");
								})
								.catch((err) => {
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
				error instanceof Error ? error.message : "Failed to generate speech",
			);
			setIsAIThinking(false); // Make sure to turn off thinking state on error
		} finally {
			setIsLoading(false);
		}
	};

	const handlePlayAudio = () => {
		if (audioRef.current && audioUrl) {
			const playPromise = audioRef.current.play();

			if (playPromise !== undefined) {
				playPromise.catch((err) => {
					console.error("Error playing audio:", err);
					setError(`Error playing audio: ${err.message}`);
				});
			}
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto bg-neutral-800 text-gray-200">
			<CardHeader>
				<CardTitle>Chat with Character</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<Textarea
						placeholder="Type your message here..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="min-h-24 bg-neutral-700 border-neutral-600 placeholder:text-neutral-400"
					/>

					<div className="space-y-2">
						<Label htmlFor="voice-select">Voice</Label>
						<Select
							value={voice}
							onValueChange={(value) => setVoice(value as Voice)}
						>
							<SelectTrigger
								id="voice-select"
								className="bg-neutral-700 border-neutral-600"
							>
								<SelectValue placeholder="Select a voice" />
							</SelectTrigger>
							<SelectContent className="bg-neutral-700 border-neutral-600">
								<SelectItem value="alloy">Alloy</SelectItem>
								<SelectItem value="echo">Echo</SelectItem>
								<SelectItem value="fable">Fable</SelectItem>
								<SelectItem value="onyx">Onyx</SelectItem>
								<SelectItem value="nova">Nova</SelectItem>
								<SelectItem value="shimmer">Shimmer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{error && (
						<div className="text-red-400 text-sm p-2 bg-red-950/30 rounded border border-red-800">
							{error}
						</div>
					)}

					<div className="flex justify-between">
						<Button
							type="submit"
							disabled={isLoading || !message.trim()}
							className="bg-primary hover:bg-primary/90"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									Send
									<Send className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>

						{audioUrl && !isLoading && (
							<Button
								type="button"
								variant="outline"
								onClick={handlePlayAudio}
								className="border-neutral-600 text-gray-200 hover:bg-neutral-700"
							>
								<Volume2 className="mr-2 h-4 w-4" />
								Play Response
							</Button>
						)}
					</div>
				</form>

				{/* Audio element */}
				{/* biome-ignore lint/a11y/useMediaCaption: Useless here. */}
				<audio ref={audioRef} controls className="mt-4 w-full" />
			</CardContent>
		</Card>
	);
}
