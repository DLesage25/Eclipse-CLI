import 'reflect-metadata';
import minimist from 'minimist';
import { inject, injectable } from 'inversify';

import { Auth } from './auth/auth';
import { Logger } from './utils/logger';
import { API } from './api';
import { Projects } from './projects';
import { CoreConfigModule } from './coreConfig';
import { Commands } from './commands';
import mainMenuPrompt from './prompts/mainMenu.prompt';

@injectable()
export class Eclipse {
    public suppressError = false;

    constructor(
        @inject('Auth') private auth: Auth,
        @inject('Logger') private logger: Logger,
        @inject('API') private _api: API,
        @inject('Projects') private projects: Projects,
        @inject('CoreConfig') private coreConfig: CoreConfigModule,
        @inject('Commands') private commands: Commands
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
            return this.commands.processCommand(
                postArguments,
                isInProjectDirectory
            );
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
}
