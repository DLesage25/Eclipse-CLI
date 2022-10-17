import 'reflect-metadata';
import { Options } from './options';
import { Auth } from './auth/auth';
import { Logger } from './utils/logger';
import { API } from './api';
import { Projects } from './projects';
import { CoreConfigModule } from './coreConfig';
export declare class Eclipse {
    private options;
    private auth;
    private logger;
    private _api;
    private projects;
    private coreConfig;
    suppressError: boolean;
    constructor(options: Options, auth: Auth, logger: Logger, _api: API, projects: Projects, coreConfig: CoreConfigModule);
    execute(): Promise<boolean>;
    private checkForCoreConfig;
    private processInjectCommand;
    private projectDirectoryActions;
    private restartCoreConfig;
    private showTopLevelMenu;
    private showIntroLog;
    private showToolVersion;
    private showHelpLog;
}
