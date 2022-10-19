import 'reflect-metadata';
import minimist from 'minimist';
import * as packageJson from '../../package.json';
import { inject, injectable } from 'inversify';

import { Options } from './options';
import { Auth } from './auth/auth';
import { Logger } from './utils/logger';
import { API } from './api';
import { Projects } from './projects';
import { CoreConfigModule } from './coreConfig';
import mainMenuPrompt from './prompts/mainMenu.prompt';
import { PROJECT_ACTIONS } from './constants/commands';

@injectable()
export class Eclipse {
    public suppressError = false;

    constructor(
        @inject('Options') private options: Options,
        @inject('Auth') private auth: Auth,
        @inject('Logger') private logger: Logger,
        @inject('API') private _api: API,
        @inject('Projects') private projects: Projects,
        @inject('CoreConfig') private coreConfig: CoreConfigModule
    ) {
        try {
            this.execute()
                .then((success) => {
                    this.logger.verticalSeparator();
                    if (!success && !this.suppressError) {
                        process.exit(1);
                    }
                })
                .catch((err) => logger.error(err));
        } catch (error) {
            if (error instanceof Error) {
                logger.error(error.message);
            } else {
                logger.error(`${error}`);
            }
            if (!this.suppressError) {
                process.exit(1);
            }
        }
    }

    public async execute(): Promise<boolean> {
        console.clear();
        this.showIntroLog();

        const argv = minimist(process.argv.slice(2));

        this.suppressError = argv.suppressError;

        const isConfigured = await this.checkForCoreConfig();

        if (!isConfigured) return true;

        const requiresRestart = await this.auth.checkIfAuthFlowRequired();

        if (requiresRestart) return true;

        await this._api.Initialize();

        this.logger.verticalSeparator();

        const { _: postArguments } = argv;

        const isInProjectDirectory =
            await this.projects.checkIfOnProjectDirectory();

        if (isInProjectDirectory && postArguments.length) {
            return this.processCommand(postArguments, isInProjectDirectory);
        }

        if (isInProjectDirectory) await this.projects.projectDirectoryMenu();
        if (!isInProjectDirectory) await this.showTopLevelMenu();

        return true;
    }

    private async checkForCoreConfig(): Promise<boolean> {
        const config = await this.coreConfig.get();

        if (config) return true;

        this.logger.warning('The CLI is syncing with Eclipse servers...');

        const cliKeys = await this._api.getCliValues();

        if (!cliKeys) return false;

        if (!cliKeys) {
            this.logger.error(
                'We were not able to contact the Eclipse servers. Please retry, or if the problem persists contact support @ support@eclipsejs.io'
            );
            return false;
        }

        await this.coreConfig.initialize(cliKeys);

        this.logger.success(
            'Eclipse has been configured successfully. Please run Eclipse again to log in. :)'
        );

        return false;
    }

    private async processCommand(
        postArguments: Array<string>,
        isInProjectDirectory: boolean
    ) {
        const [coreCommand] = postArguments;

        if (PROJECT_ACTIONS[coreCommand]) {
            if (!isInProjectDirectory) return false;

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

    private async showTopLevelMenu(): Promise<boolean> {
        const { action } = await mainMenuPrompt();

        if (action === 'view') await this.projects.projectSelection();
        if (action === 'logout') await this.auth.logout();
        return true;
    }

    private showIntroLog(): void {
        this.logger.banner('EclipseJS', { horizontalLayout: 'full' });
        this.logger.message(`Inject environment variables on runtime.`);
    }

    private showToolVersion(): void {
        this.logger.message(`Version: ${packageJson.version}`);
    }

    private showHelpLog(): void {
        this.options.showOptions();
    }
}
