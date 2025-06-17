"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isAdminModeEnabledAtom, showAdminUnlockCardAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { AlertCircle, Lock, Unlock } from "lucide-react";
import { useState } from "react";

export function AdminUnlockCard() {
	const [adminCode, setAdminCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isAdminModeEnabled, setIsAdminModeEnabled] = useAtom(
		isAdminModeEnabledAtom,
	);
	const [, setShowAdminUnlockCard] = useAtom(showAdminUnlockCardAtom);

	const validateAdminCode = async () => {
		try {
			const response = await fetch("/api/validate-admin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code: adminCode }),
			});

			const data = await response.json();

			if (data.success) {
				setIsAdminModeEnabled(true);
				setShowAdminUnlockCard(false);
			} else {
				setError("Invalid admin code. Please try again.");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
			console.error("Error validating admin code:", err);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!adminCode.trim()) {
			setError("Please enter an admin code");
			return;
		}

		validateAdminCode();
	};

	return (
		<Card className="w-80 bg-neutral-800 text-gray-200">
			<CardHeader className="flex flex-row items-center gap-2">
				<Lock className="h-5 w-5" />
				<CardTitle>Admin Access</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Input
							type="password"
							placeholder="Enter admin code"
							value={adminCode}
							onChange={(e) => setAdminCode(e.target.value)}
							className="bg-neutral-700 border-neutral-600"
						/>
						{error && (
							<div className="flex items-center gap-2 text-red-400 text-sm">
								<AlertCircle className="h-4 w-4" />
								<span>{error}</span>
							</div>
						)}
					</div>
					<Button
						type="submit"
						className="w-full bg-primary hover:bg-primary/90"
					>
						<Unlock className="mr-2 h-4 w-4" />
						Unlock Admin Mode
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
