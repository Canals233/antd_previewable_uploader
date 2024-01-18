const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");
const { babel } = require("@rollup/plugin-babel");

/**@type {import('rollup').RollupOptions} */
module.exports = {
	input: "./src/index.tsx",
	output: {
		dir: "./dist",
		format: "esm",
		sourcemap: true,
		preserveModules: true,
	},
	plugins: [
		resolve(),
		commonjs(),
		typescript(),
		babel({
			exclude: "node_modules/**",
			babelHelpers: "bundled",
		}),
	],
	external: ["antd","react","react/jsx-runtime","react-dom","@ant-design/icons","@ant-design/icons/lib"],
};
