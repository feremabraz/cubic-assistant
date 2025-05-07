import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { code } = await request.json();
		const adminKey = process.env.ADMIN_KEY;

		if (!adminKey) {
			console.error("ADMIN_KEY environment variable is not set");
			return NextResponse.json(
				{ success: false, message: "Server configuration error" },
				{ status: 500 },
			);
		}

		const isValid = code === adminKey;

		return NextResponse.json({ success: isValid });
	} catch (error) {
		console.error("Error validating admin code:", error);
		return NextResponse.json(
			{ success: false, message: "An error occurred" },
			{ status: 500 },
		);
	}
}
