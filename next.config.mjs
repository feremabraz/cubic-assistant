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
		// outputFileTracingIncludes: {
		// 	"/app/**": ["./data/CV_Fernando_Braz.txt"], // Handled by webpack now
		// },
	},
	webpack: (config, { isServer, webpack }) => {
		config.module.rules.push({
			test: /\.txt$/,
			type: "asset/source",
		});
		return config;
	},
};

export default nextConfig;
