import { injectable } from 'inversify';
import { spawn } from 'child_process';

@injectable()
export class Shell {
    public initialize(
        coreProcess: string,
        processArgs: string[],
        env: { [key: string]: string }
    ) {
        const sanitizedEnv = this.sanitizeEnv({ ...process.env, ...env });
        spawn(coreProcess, processArgs, {
            stdio: 'inherit',
            env: sanitizedEnv,
        });
    }

    private sanitizeEnv(env: { [key: string]: string | undefined }) {
        const unsanitizedEnv = {
            ...process.env,
            ...env,
        };

        const sanitizedEnv = Object.entries(unsanitizedEnv).reduce(
            (prev, current) => {
                const [key, value] = current;

                if (key.includes('ECLIPSE')) return prev;

                prev[key] = value;
                return prev;
            },
            {}
        );

        return sanitizedEnv;
    }
}
