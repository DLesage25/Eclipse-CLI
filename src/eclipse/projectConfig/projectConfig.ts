import { inject, injectable } from 'inversify';
import { FileUtil } from '../utils/fileUtil';
import { Logger } from '../utils/logger';

@injectable()
export default class ProjectConfig {
    constructor(
        @inject('Logger') private logger: Logger,
        @inject('ConfigFile') private configFile: FileUtil
    ) {}

    public async createConfigFile(PROJECT: string, COMPONENT: string) {
        await this.configFile.createOrUpdate({
            data: { PROJECT, COMPONENT },
            fileComment:
                '# This file was autogenerated by the Eclipse CLI and connects your working directory to an Eclipse project.',
        });
        this.logger.success('Config file created on current directory.');
    }

    public async readConfigFile() {
        return this.configFile.readIntoObject<{
            PROJECT: string;
            COMPONENT: string;
        }>();
    }

    public async checkIfExists() {
        return this.configFile.find();
    }
}
