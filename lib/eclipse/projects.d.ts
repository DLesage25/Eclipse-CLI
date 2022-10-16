import { API } from './api';
import { Cmd } from './cmd';
import { ProjectConfig } from './projectConfig';
import { Secrets } from './secrets';
import { FileUtil } from './utils/fileUtil';
import { Logger } from './utils/logger';
export declare class Projects {
    private _api;
    private logger;
    private secrets;
    private envFile;
    private projectConfig;
    private cmd;
    constructor(_api: API, logger: Logger, secrets: Secrets, envFile: FileUtil, projectConfig: ProjectConfig, cmd: Cmd);
    private projectActions;
    projectSelection(): Promise<void | null>;
    private getProject;
    private promptSingleProjectActions;
    private viewProjectSecrets;
    private printSecrets;
    projectDirectoryMenu(): Promise<boolean>;
    checkIfOnProjectDirectory(): Promise<boolean>;
    getCurrentProjectSecrets(): Promise<{
        [key: string]: string;
    } | undefined>;
    injectLocalProjectSecrets(coreProcess: string, processArgs: string[]): Promise<void>;
}
