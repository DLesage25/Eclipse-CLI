import { FileUtil } from './utils/fileUtil';
import { Logger } from './utils/logger';
export declare class ProjectConfig {
    private logger;
    private configFile;
    constructor(logger: Logger, configFile: FileUtil);
    createConfigFile(projectId: string): Promise<void>;
    readConfigFile(): Promise<{}>;
    checkIfExists(): Promise<boolean>;
}
