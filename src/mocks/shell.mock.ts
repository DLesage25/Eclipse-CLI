import Shell from 'eclipse/shell';

export class ShellMock implements Shell {
    public initialize(
        coreProcess: string,
        processArgs: string[],
        env: { [key: string]: string }
    ): void {
        return;
    }

    public sanitizeEnv(env: {
        [key: string]: string | undefined;
    }): Record<string, unknown> {
        return {};
    }
}
