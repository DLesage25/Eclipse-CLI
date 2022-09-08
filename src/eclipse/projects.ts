import { inject, injectable } from 'inversify';
import { API } from './api';
import projectSelectionPrompt from './prompts/projectSelection.prompt';
import { Secrets } from './secrets';
import { Project } from './types/Project.type';
import { FileUtil, objectToFileNotation } from './utils/fileUtil';
import { Logger } from './utils/logger';

@injectable()
export class Projects {
    constructor(
        @inject('API') private _api: API,
        @inject('Logger') private logger: Logger,
        @inject('Secrets') private secrets: Secrets,
        @inject('EnvFile') private envFile: FileUtil
    ) {}

    public async projectSelection() {
        const projects = await this._api.getProjects();

        if (!projects.length) {
            this.logger.warning(`No projects found. Try creating one first.`);
            return;
        }

        const { projectId, action } = await projectSelectionPrompt(projects);

        const selectedProject = projects.find((p) => p._id === projectId);

        if (!selectedProject) {
            this.logger.warning('No project selected.');
            return;
        }

        switch (action) {
            case 'view':
                return this.viewProjectSecrets(selectedProject);
            case 'add':
                return this.secrets.addSecret(selectedProject);
            case 'remove':
                return this.secrets.removeSecret(selectedProject);
            case 'print':
                return this.printSecrets(selectedProject);
            default:
                this.logger.warning('Command not recognized');
                return;
        }
    }

    private async viewProjectSecrets(project: Project) {
        const secrets = await this.secrets.getSecrets(project);

        if (!secrets) {
            this.logger.warning(`No secrets found for project ${project.name}`);
            return;
        }

        const formattedSecrets = objectToFileNotation(secrets);
        this.logger.success(formattedSecrets);
        return;
    }

    private async printSecrets(project: Project) {
        const secrets = await this.secrets.getSecrets(project);

        if (!secrets) {
            this.logger.warning(`No secrets found for project ${project.name}`);
            return;
        }

        await this.envFile.createOrUpdate(secrets);
        this.logger.success('Environment file printed on working directory.');
        return;
    }
}
