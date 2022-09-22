import { inject, injectable } from 'inversify';
import { API } from './api';
import projectSelectionPrompt from './prompts/projectSelection.prompt';
import singleProjectActionPrompt from './prompts/singleProjectAction.prompt';
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

    private projectActions(action: string, project: Project) {
        switch (action) {
            case 'view':
                return this.viewProjectSecrets(project);
            case 'add':
                return this.secrets.addSecret(project);
            case 'remove':
                return this.secrets.removeSecret(project);
            case 'print':
                return this.printSecrets(project);
            default:
                this.logger.warning('Command not recognized');
                return;
        }
    }

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

        return this.projectActions(action, selectedProject);
    }

    public async getProject(projectId: string) {
        const [project] = await this._api.getProjects(projectId);
        return project;
    }

    public async promptSingleProjectActions(projectId: string) {
        const project = await this.getProject(projectId);

        if (!project) {
            this.logger.error(
                'It looks like you do not have access to the project tagged in this directory.'
            );
            return;
        }

        this.logger.message(
            `This directory is tagged for project ${project.name}`
        );

        const { action } = await singleProjectActionPrompt();

        return this.projectActions(action, project);
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
