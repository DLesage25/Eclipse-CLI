import { API } from './api';
import { Project } from './types/Project.type';
import { Logger } from './utils/logger';
export declare class Secrets {
    private _api;
    private logger;
    constructor(_api: API, logger: Logger);
    addSecret(project: Project): Promise<void>;
    getSecrets(project: Project): Promise<{
        [key: string]: string;
    } | undefined>;
    removeSecret(project: Project): Promise<void | null>;
}
