import { atom } from "jotai";

// Types
export type Expression =
	| "neutral"
	| "happy"
	| "sad"
	| "surprised"
	| "angry"
	| "confused"
	| "excited"
	| "skeptical"
	| "smirk";
export type Gesture =
	| "none"
	| "pointLeft"
	| "pointRight"
	| "stretch"
	| "reachFront";
export type LookDirection = "center" | "left" | "right" | "top" | "bottom";
export type BodyPose = "standing" | "walking" | "running" | "jumping";

// Character
export const isTalkingAtom = atom(false);
export const isWalkingAtom = atom(false);
export const expressionAtom = atom<Expression>("neutral");
export const expressionIntensityAtom = atom(1);
export const gestureAtom = atom<Gesture>("none");
export const lookDirectionAtom = atom<LookDirection>("center");
export const isWireframeAtom = atom(false);
export const bodyPoseAtom = atom<BodyPose>("standing");
export const bodyPoseIntensityAtom = atom(1);

// UI
export const showGizmoAtom = atom(false);
export const showMeasurementsAtom = atom(false);
export const showUnitExplanationAtom = atom(false);

// Admin control
export const isAdminModeEnabledAtom = atom(false);
export const showAdminUnlockCardAtom = atom(false);

// AI thinking
export const isAIThinkingAtom = atom(false);

// Add this to the existing atoms
export const audioPlaybackAtom = atom<{
	isPlaying: boolean;
	duration: number;
	currentTime: number;
}>({
	isPlaying: false,
	duration: 0,
	currentTime: 0,
});

// Add this new atom to the existing atoms
export const showResponseDebugAtom = atom(false);

// Derived atoms
export const pointLeftAtom = atom(
	(get) => get(gestureAtom) === "pointLeft",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(gestureAtom, "pointLeft");
		} else if (get(gestureAtom) === "pointLeft") {
			set(gestureAtom, "none");
		}
	},
);

export const pointRightAtom = atom(
	(get) => get(gestureAtom) === "pointRight",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(gestureAtom, "pointRight");
		} else if (get(gestureAtom) === "pointRight") {
			set(gestureAtom, "none");
		}
	},
);

export const stretchAtom = atom(
	(get) => get(gestureAtom) === "stretch",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(gestureAtom, "stretch");
		} else if (get(gestureAtom) === "stretch") {
			set(gestureAtom, "none");
		}
	},
);

export const reachFrontAtom = atom(
	(get) => get(gestureAtom) === "reachFront",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(gestureAtom, "reachFront");
		} else if (get(gestureAtom) === "reachFront") {
			set(gestureAtom, "none");
		}
	},
);

export const lookLeftAtom = atom(
	(get) => get(lookDirectionAtom) === "left",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(lookDirectionAtom, "left");
		} else if (get(lookDirectionAtom) === "left") {
			set(lookDirectionAtom, "center");
		}
	},
);

export const lookRightAtom = atom(
	(get) => get(lookDirectionAtom) === "right",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(lookDirectionAtom, "right");
		} else if (get(lookDirectionAtom) === "right") {
			set(lookDirectionAtom, "center");
		}
	},
);

export const lookTopAtom = atom(
	(get) => get(lookDirectionAtom) === "top",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(lookDirectionAtom, "top");
		} else if (get(lookDirectionAtom) === "top") {
			set(lookDirectionAtom, "center");
		}
	},
);

export const lookBottomAtom = atom(
	(get) => get(lookDirectionAtom) === "bottom",
	(get, set, newValue: boolean) => {
		if (newValue) {
			set(lookDirectionAtom, "bottom");
		} else if (get(lookDirectionAtom) === "bottom") {
			set(lookDirectionAtom, "center");
		}
	},
);
