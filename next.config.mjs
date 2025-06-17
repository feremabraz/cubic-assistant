/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	experimental: {
		outputFileTracingIncludes: {
			"/app/**": ["./public/CV_Fernando_Braz.txt"],
		},
	},
};

export default nextConfig;
