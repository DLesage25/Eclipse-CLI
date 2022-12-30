import { inject, injectable } from 'inversify';
import * as packageJson from '../../package.json';
import confirmPrompt from './prompts/confirm.prompt';
import Projects from './projects';
import Auth from './auth';
import Secrets from './secrets';
import { Logger } from './utils/logger';
import { Project } from './types/Project.type';
import { PROJECT_COMMANDS } from './constants/projectCommands';
import { helpMessage } from './constants/messages';

@injectable()
export class Commands {
    constructor(
        @inject('Logger') private logger: Logger,
        @inject('Projects') private projects: Projects,
        @inject('Auth') private auth: Auth,
        @inject('Secrets') private secrets: Secrets
    ) {}

    public async processCommand(
        postArguments: Array<string>,
        isInProjectDirectory: boolean
    ) {
        const [coreCommand] = postArguments;

        if (PROJECT_COMMANDS[coreCommand]) {
            if (!isInProjectDirectory) {
                this.logger.warning(
                    'You need to be on a project directory to use this command.'
                );
                return false;
            }

            return this.processProjectCommand(postArguments);
        }

        return this.processGenericCommand(postArguments);
    }

    private async processGenericCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [coreCommand] = postArguments;

        switch (coreCommand) {
            case 'help':
            case 'h':
                this.showHelpLog();
                return true;
            case 'version':
            case 'v':
                this.showToolVersion();
                return true;
            case 'logout':
                await this.auth.logout();
                return true;
            default:
                this.logger.warning('Command not recognized');
                return false;
        }
    }

    private async processProjectCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [coreCommand, ...commandArgs] = postArguments;

        switch (coreCommand) {
            case 'inject':
            case 'i':
                return this.processInjectCommand(commandArgs);
            case 'add':
            case 'a':
                return this.processAddCommand(commandArgs);
            case 'list':
            case 'ls':
                return this.processListCommand(commandArgs);
            case 'remove':
            case 'rm':
                return this.processRemoveCommand(commandArgs);
            default:
                this.logger.warning('Command not recognized');
                return false;
        }
    }

    private async processRemoveCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [removeArgs, secretName] = postArguments;

        if (!removeArgs.includes('/')) {
            this.logger.error(
                'Please specify a component and environment: `eclipse rm component/environment secret_name`'
            );
            return false;
        }

        const [component, environment] = removeArgs.split('/');
        const project = await this.getCurrentProject();

        if (!project) {
            return false;
        }

        const secrets = await this.secrets.getFullSecrets(
            project,
            component,
            environment
        );

        if (!secrets) {
            return false;
        }

        const secret = secrets[secretName];

        if (!secret) {
            this.logger.error(
                `Secret ${secretName} not found under project ${project.name}`
            );
            return false;
        }

        const { confirm } = await confirmPrompt(
            'This action cannot be undone. Please confirm deletion:'
        );

        if (!confirm) {
            this.logger.message('Aborted.');
            return false;
        }

        await this.secrets.removeSecret({
            secretId: secret._id,
            secretName,
        });

        return true;
    }

    private async getCurrentProject(): Promise<Project | null> {
        const project = await this.projects.getCurrentProject();

        if (!project) {
            this.logger.error(
                'Could not fetch current project. Please try again.'
            );
            return null;
        }
        return project;
    }

    private async processListCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [listArgs] = postArguments;

        if (!listArgs) {
            this.logger.error(
                'Please specify a component and environment: `eclipse ls component/environment`.'
            );
            return false;
        }

        const [component, environment] = listArgs.split('/');

        const project = await this.getCurrentProject();

        if (!project) {
            return false;
        }

        await this.projects.viewProjectSecrets(project, component, environment);

        return true;
    }

    private async processAddCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [addArgs, secretName, secretValue] = postArguments;

        if (!addArgs.includes('/')) {
            this.logger.error(
                'Please specify a component and environment: `eclipse add component/environment secret_name secret_value`'
            );
            return false;
        }

        const [component, environment] = addArgs.split('/');

        const project = await this.getCurrentProject();

        if (!project) {
            return false;
        }

        await this.secrets.addSecret(
            project,
            secretName,
            secretValue,
            component,
            environment
        );
        return true;
    }

    private async processInjectCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [injectArg, coreProcess, ...processArgs] = postArguments;

        if (!injectArg.includes('/')) {
            this.logger.error(
                'Please specify a component and environment: `eclipse i component/environment node`'
            );
            return false;
        }

        const [component, environment] = injectArg.split('/');

        await this.projects.injectLocalProjectSecrets(
            coreProcess,
            processArgs,
            component,
            environment
        );

        return true;
    }

    private showToolVersion(): void {
        this.logger.message(`Version: ${packageJson.version}`);
    }

    private showHelpLog(): void {
        this.logger.message(helpMessage);
    }
}
