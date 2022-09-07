import { inject, injectable } from 'inversify';
import { API } from './api';
import projectSelectionPrompt from './prompts/projectSelection.prompt';
import { Secrets } from './secrets';
import { Project } from './types/Project.type';
import { objectToFileNotation } from './utils/fileUtil';
import { Logger } from './utils/logger';

@injectable()
export class Projects {
    constructor(
        @inject('API') private _api: API,
        @inject('Logger') private logger: Logger,
        @inject('Secrets') private secrets: Secrets
    ) {}

    public async projectSelection() {
        const projects = await this._api.getProjects();
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
        const formattedSecrets = objectToFileNotation(secrets);
        this.logger.success(formattedSecrets);
        return;
    }

    private async printSecrets(project: Project) {}
}
