import tsConfig from '@rollup/plugin-typescript';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import autoExternal from 'rollup-plugin-auto-external';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

import { terser } from 'rollup-plugin-terser';

import dotenv from 'dotenv';

dotenv.config();

export default {
    input: 'src/index.ts',
    output: {
        file: 'lib/index.js',
        format: 'cjs',
    },
    plugins: [
        commonjs(),
        nodeResolve({
            jsnext: true,
            main: true,
        }),
        tsConfig({ module: 'ESNext' }),
        jsonPlugin(),
        replace({
            'process.env.ECLIPSE_API_URL': JSON.stringify(
                process.env.ECLIPSE_API_URL
            ),
            'process.env.ECLIPSE_CLI_KEY': JSON.stringify(
                process.env.ECLIPSE_CLI_KEY
            ),
            preventAssignment: true,
        }),
        autoExternal({
            builtins: false,
            dependencies: true,
        }),
        globals(),
        terser(),
    ],
};
