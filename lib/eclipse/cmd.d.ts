export declare class Cmd {
    initialize(coreProcess: string, processArgs: string[], env: {
        [key: string]: string;
    }): void;
    private sanitizeEnv;
}
