"use client";

import { isAIThinkingAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";

export function ThinkingIndicatorDebug() {
	const isAIThinking = useAtomValue(isAIThinkingAtom);
	console.log("ThinkingIndicatorDebug - thinking state:", isAIThinking);
	// This component doesn't render anything
	return null;
}
