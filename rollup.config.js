import tsConfig from '@rollup/plugin-typescript';
import jsonPlugin from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import autoExternal from 'rollup-plugin-auto-external';
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
            'process.env.AUTH_SERVER_PORT': JSON.stringify(
                process.env.AUTH_SERVER_PORT
            ),
            'process.env.AUTH_CLIENT_ID': JSON.stringify(
                process.env.AUTH_CLIENT_ID
            ),
            'process.env.AUTH_DOMAIN': JSON.stringify(process.env.AUTH_DOMAIN),
            'process.env.AUTH_CALLBACK_URL': JSON.stringify(
                process.env.AUTH_CALLBACK_URL
            ),
            'process.env.AUTH_TARGET_AUDIENCE': JSON.stringify(
                process.env.AUTH_TARGET_AUDIENCE
            ),
            'process.env.ECLIPSE_API_URL': JSON.stringify(
                process.env.ECLIPSE_API_URL
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
