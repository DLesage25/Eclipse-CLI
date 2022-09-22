import { inject, injectable } from 'inversify';
import { FileUtil } from './utils/fileUtil';
import { Logger } from './utils/logger';

@injectable()
export class ProjectConfig {
    constructor(
        @inject('Logger') private logger: Logger,
        @inject('ConfigFile') private configFile: FileUtil
    ) {}

    public async createConfigFile(projectId: string) {
        await this.configFile.createOrUpdate({ PROJECT: projectId });
        this.logger.success('Config file created on current directory.');
    }

    public async readConfigFile() {
        return this.configFile.readIntoObject<{ PROJECT: string }>();
    }

    public async checkIfExists() {
        return this.configFile.find();
    }
}
