import { inject, injectable } from 'inversify';
import * as packageJson from '../../package.json';
import confirmPrompt from './prompts/confirm.prompt';
import Projects from './projects';
import Auth from './auth';
import { Logger } from './utils/logger';
import { Options } from './options';
import { Secrets } from './secrets';
import { Project } from './types/Project.type';
import { PROJECT_COMMANDS } from './constants/projectCommands';

@injectable()
export class Commands {
    constructor(
        @inject('Options') private options: Options,
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
        const [secretName, rawClassifiers] = postArguments;
        const classifiers = rawClassifiers
            ? rawClassifiers.split(',').filter((i) => i !== '')
            : undefined;

        const project = await this.getCurrentProject();

        if (!project) {
            return false;
        }

        const secrets = await this.secrets.getFullSecrets(project, classifiers);

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

        await this.secrets.removeSecret(secret);

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
        const [rawClassifiers] = postArguments;
        const classifiers = rawClassifiers
            ? rawClassifiers.split(',').filter((i) => i !== '')
            : undefined;

        const project = await this.getCurrentProject();

        if (!project) {
            return false;
        }

        await this.projects.viewProjectSecrets(project, classifiers);

        return true;
    }

    private async processAddCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [secretName, secretValue, rawClassifiers] = postArguments;

        const project = await this.getCurrentProject();

        if (!project) {
            return false;
        }

        await this.secrets.addSecret(
            project,
            secretName,
            secretValue,
            rawClassifiers
        );
        return true;
    }

    private async processInjectCommand(
        postArguments: Array<string>
    ): Promise<boolean> {
        const [injectArg, coreProcess, ...processArgs] = postArguments;

        const classifiers =
            injectArg !== 'all'
                ? injectArg.split(',').filter((i) => i !== '')
                : undefined;

        await this.projects.injectLocalProjectSecrets(
            coreProcess,
            processArgs,
            classifiers
        );

        return true;
    }

    private showToolVersion(): void {
        this.logger.message(`Version: ${packageJson.version}`);
    }

    private showHelpLog(): void {
        this.options.showOptions();
    }
}
