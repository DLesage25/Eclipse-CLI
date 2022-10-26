import 'reflect-metadata';

import Shell from './shell';
import { spawn } from 'child_process';

jest.mock('child_process');

describe('Shell', () => {
    const shell = new Shell();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('initialize', () => {
        it('should spawn a new child process', async () => {
            await shell.initialize('test', ['arg1', 'arg2'], { env1: 'test' });

            const env = {
                ...process.env,
                env1: 'test',
            };

            //@ts-ignore
            delete env.ECLIPSE_API_URL;
            //@ts-ignore
            delete env.ECLIPSE_CLI_KEY;

            expect(spawn).toHaveBeenCalledTimes(1);
            expect(spawn).toHaveBeenCalledWith('test', ['arg1', 'arg2'], {
                stdio: 'inherit',
                env,
            });
        });
    });

    describe('sanitizeEnv', () => {
        it('should sanitize environment variables and remove eclipse variables', async () => {
            const result = await shell.sanitizeEnv({
                ECLIPSE_TEST: 'test',
                env1: 'test',
            });

            const env = {
                ...process.env,
                env1: 'test',
            };

            //@ts-ignore
            delete env.ECLIPSE_API_URL;
            //@ts-ignore
            delete env.ECLIPSE_CLI_KEY;

            expect(result).toEqual(env);
        });
    });
});
