"use client";

import { bodyPoseAtom, isWalkingAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useEffect } from "react";

/**
 * This component doesn't render anything but handles synchronizing
 * the character state atoms based on control inputs
 */
export function CharacterController() {
	const [isWalking, setIsWalking] = useAtom(isWalkingAtom);
	const [bodyPose, setBodyPose] = useAtom(bodyPoseAtom);

	// Sync walking state with body pose
	useEffect(() => {
		if (isWalking) {
			setBodyPose("walking");
		} else {
			setBodyPose("standing");
		}
	}, [isWalking, setBodyPose]);

	return null;
}
