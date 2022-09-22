import { inject, injectable } from 'inversify';
import { Projects } from './projects';
import { FileUtil } from './utils/fileUtil';
import { Logger } from './utils/logger';

@injectable()
export class ProjectConfig {
    constructor(
        @inject('Logger') private logger: Logger,
        @inject('ConfigFile') private configFile: FileUtil,
        @inject('Projects') private projects: Projects
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

    public async checkIfOnProjectDirectory() {
        const onProjectDirectory = await this.checkIfExists();

        if (!onProjectDirectory) {
            return false;
        }

        const configData = await this.readConfigFile();

        if (!configData['PROJECT']) {
            this.logger.error(
                'Malformed config file. Try re-creating the .eclipserc file in your project directory.'
            );
            return true;
        }

        await this.projects.promptSingleProjectActions(configData['PROJECT']);

        return true;
    }
}
