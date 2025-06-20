"use client";

import { isAIThinkingAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";

export function ThinkingIndicatorDebug() {
	const isAIThinking = useAtomValue(isAIThinkingAtom);
	console.log("ThinkingIndicatorDebug - thinking state:", isAIThinking);
	// This component doesn't render anything
	return null;
}
