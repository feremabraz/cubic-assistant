"use client";

import { isAdminModeEnabledAtom, showAdminUnlockCardAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { useEffect } from "react";

export function KeyboardShortcuts() {
	const [isAdminModeEnabled, setIsAdminModeEnabled] = useAtom(
		isAdminModeEnabledAtom,
	);
	const [showAdminUnlockCard, setShowAdminUnlockCard] = useAtom(
		showAdminUnlockCardAtom,
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === "y") {
				event.preventDefault();
				if (isAdminModeEnabled) {
					setIsAdminModeEnabled(false);
					setShowAdminUnlockCard(false);
				} else {
					setShowAdminUnlockCard((prev) => !prev);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isAdminModeEnabled, setIsAdminModeEnabled, setShowAdminUnlockCard]);

	return null; // This component doesn't render anything
}
