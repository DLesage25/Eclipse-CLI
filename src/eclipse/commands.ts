import { inject, injectable } from 'inversify';
import { Projects } from './projects';
import { Logger } from './utils/logger';
import * as packageJson from '../../package.json';
import { Options } from './options';
import { PROJECT_ACTIONS } from './constants/commands';
import { Auth } from './auth/auth';

@injectable()
export class Commands {
    constructor(
        @inject('Options') private options: Options,
        @inject('Logger') private logger: Logger,
        @inject('Projects') private projects: Projects,
        @inject('Auth') private auth: Auth
    ) {}

    public async processCommand(
        postArguments: Array<string>,
        isInProjectDirectory: boolean
    ) {
        const [coreCommand] = postArguments;

        if (PROJECT_ACTIONS[coreCommand]) {
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
            default:
                this.logger.warning('Command not recognized');
                return false;
        }
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
