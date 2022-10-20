import { inject, injectable } from 'inversify';
import { API } from './api';
import { Shell } from './shell';
import { ProjectConfig } from './projectConfig';
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
        @inject('EnvFile') private envFile: FileUtil,
        @inject('ProjectConfig') private projectConfig: ProjectConfig,
        @inject('Shell') private shell: Shell
    ) {}

    private projectActions(action: string, project: Project) {
        switch (action) {
            case 'view':
                return this.viewProjectSecrets(project);
            case 'add':
                return this.secrets.addSecretFromMenu(project);
            case 'remove':
                return this.secrets.removeSecretFromMenu(project);
            case 'print':
                return this.printSecrets(project);
            case 'createConfig':
                return this.projectConfig.createConfigFile(project._id);
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

    private async getProject(projectId: string) {
        const [project] = await this._api.getProjects(projectId);
        return project;
    }

    private async promptSingleProjectActions(projectId: string) {
        const project = await this.getProject(projectId);

        if (!project) {
            this.logger.error(
                'It looks like you do not have access to the project tagged in this directory.'
            );
            return;
        }

        const { action } = await singleProjectActionPrompt(project.name);

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

    public async projectDirectoryMenu() {
        const onProjectDirectory = await this.projectConfig.checkIfExists();

        if (!onProjectDirectory) {
            return false;
        }

        const configData = await this.projectConfig.readConfigFile();

        if (!configData['PROJECT']) {
            this.logger.error(
                'Malformed config file. Try re-creating the .eclipserc file in your project directory.'
            );
            return true;
        }

        await this.promptSingleProjectActions(configData['PROJECT']);

        return true;
    }

    public async checkIfOnProjectDirectory() {
        return this.projectConfig.checkIfExists();
    }

    public async getCurrentProject(): Promise<Project | undefined> {
        const configData = await this.projectConfig.readConfigFile();

        if (!configData['PROJECT']) {
            this.logger.error(
                'Malformed config file. Try re-creating the .eclipserc file in your project directory.'
            );
            return;
        }

        return this.getProject(configData['PROJECT']);
    }

    public async getCurrentProjectSecrets(classifiers?: string[]) {
        const project = await this.getCurrentProject();

        if (!project) return;

        const secrets = await this.secrets.getSecrets(project, classifiers);

        if (!secrets) {
            this.logger.warning(`No secrets found for project ${project.name}`);
            return;
        }

        return secrets;
    }

    public async injectLocalProjectSecrets(
        coreProcess: string,
        processArgs: string[],
        classifiers?: string[]
    ) {
        const secrets = await this.getCurrentProjectSecrets(classifiers);
        if (!secrets) return;
        return this.shell.initialize(coreProcess, processArgs, secrets);
    }
}
