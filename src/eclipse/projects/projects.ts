import { inject, injectable } from 'inversify';
import Table from 'cli-table';

import API from '../api';
import Shell from '../shell';
import ProjectConfig from '../projectConfig';
import projectSelectionPrompt from '../prompts/projectSelection.prompt';
import singleProjectActionPrompt from '../prompts/singleProjectAction.prompt';
import componentSelectionPrompt from '../prompts/componentSelection.prompt';
import environmentSelectionPrompt from '../prompts/environmentSelection.prompt';
import Secrets from '../secrets';
import { FileUtil } from '../utils/fileUtil';
import { Logger } from '../utils/logger';
import { Project } from '../types/Project.type';
import { helpMessage } from '../constants/messages';
import componentCreationPrompt from 'eclipse/prompts/componentCreation.prompt';

@injectable()
export default class Projects {
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
                return this.viewProjectSecretsFromMenu(project);
            case 'add':
                return this.secrets.addSecretFromMenu(project);
            case 'remove':
                return this.secrets.removeSecretFromMenu(project);
            case 'print':
                return this.printSecrets(project);
            case 'createConfig':
                return this.createConfigFile(project);
            case 'help':
                this.logger.message(helpMessage);
                return;
            case 'exit':
                return;
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

    public async viewProjectSecretsFromMenu(project: Project) {
        const { component } = await componentSelectionPrompt(project.secrets);

        const availableSecrets = project.secrets.filter(
            (s) => s.component === component
        );

        const { environment } = await environmentSelectionPrompt(
            availableSecrets
        );

        const secrets = await this.secrets.getFullSecrets(
            project,
            component,
            environment
        );

        if (!secrets) {
            this.logger.warning(
                `No secrets found for project ${project.name}: component ${component} and environment ${environment}`
            );
            return;
        }

        const formattedSecrets = Object.entries(secrets).map(
            ([secretName, secret]) => [
                secretName,
                secret.value,
                secret.created_at,
            ]
        );

        const secretTable = new Table({
            head: ['Name', 'Value', 'Created'],
            colWidths: [30, 30, 40],
            rows: formattedSecrets,
        });

        this.logger.success(secretTable.toString());
        return;
    }

    public async viewProjectSecrets(
        project: Project,
        component: string,
        environment: string
    ) {
        const secrets = await this.secrets.getFullSecrets(
            project,
            component,
            environment
        );

        if (!secrets) {
            this.logger.warning(
                `No secrets found for project ${project.name}: component ${component} and environment ${environment}`
            );
            return;
        }

        const formattedSecrets = Object.entries(secrets).map(
            ([secretName, secret]) => [
                secretName,
                secret.value,
                secret.created_at,
            ]
        );

        const secretTable = new Table({
            head: ['Name', 'Value', 'Created'],
            colWidths: [30, 30, 40],
            rows: formattedSecrets,
        });

        this.logger.success(secretTable.toString());
        return;
    }

    private async printSecrets(project: Project) {
        const { component } = await componentSelectionPrompt(project.secrets);

        const availableSecrets = project.secrets.filter(
            (s) => s.component === component
        );

        if (!availableSecrets) {
            this.logger.warning(
                `No secrets found under ${component} component.`
            );
            return;
        }

        const { environment } = await environmentSelectionPrompt(
            availableSecrets
        );

        const secrets = await this.secrets.getPartialSecrets(
            project,
            component,
            environment
        );

        if (!secrets) {
            this.logger.warning(`No secrets found for project ${project.name}`);
            return;
        }

        await this.envFile.createOrUpdate({
            data: secrets,
            typeSuffix: environment,
            fileComment: '# Environment file generated by EclipseJS',
        });

        this.logger.success(
            `.env file for ${environment} environment printed on working directory.`
        );
        return;
    }

    public async projectDirectoryMenu() {
        const onProjectDirectory = await this.projectConfig.checkIfExists();

        if (!onProjectDirectory) {
            return false;
        }

        const configData = await this.projectConfig.readConfigFile();

        if (!configData || !configData.PROJECT) {
            this.logger.error(
                'Malformed config file. Try re-creating the .eclipserc file in your project directory.'
            );
            return false;
        }

        await this.promptSingleProjectActions(configData.PROJECT);

        return true;
    }

    public async checkIfOnProjectDirectory() {
        return this.projectConfig.checkIfExists();
    }

    public async getCurrentContext(): Promise<
        { project: Project; component: string } | undefined
    > {
        const configData = await this.projectConfig.readConfigFile();

        if (!configData || !configData.PROJECT) {
            this.logger.error(
                'Malformed or inexistent config file. Try creating a configuration file in this directory using the main menu.'
            );
            return;
        }

        const project = await this.getProject(configData.PROJECT);

        return { project, component: configData.COMPONENT };
    }

    public async getCurrentProjectSecrets(
        component: string,
        environment: string
    ) {
        const ctx = await this.getCurrentContext();

        if (!ctx) return;

        const secrets = await this.secrets.getPartialSecrets(
            ctx.project,
            component,
            environment
        );

        if (!secrets) {
            this.logger.warning(
                `No secrets found for project ${ctx.project.name}`
            );
            return;
        }

        return secrets;
    }

    public async injectLocalProjectSecrets(
        coreProcess: string,
        processArgs: string[],
        component: string,
        environment: string
    ) {
        const secrets = await this.getCurrentProjectSecrets(
            component,
            environment
        );
        return this.shell.initialize(coreProcess, processArgs, secrets || {});
    }

    private async createConfigFile(project: Project) {
        if (!project.secrets.length) {
            const { component } = await componentCreationPrompt();
            this.projectConfig.createConfigFile(project._id, component);

            return;
        }

        const { component: selection } = await componentSelectionPrompt(
            project.secrets
        );

        if (selection === 'Other') {
            const { component } = await componentCreationPrompt();
            this.projectConfig.createConfigFile(project._id, component);

            return;
        }

        this.projectConfig.createConfigFile(project._id, selection);
        return;
    }
}
