import 'reflect-metadata';
import minimist from 'minimist';
import * as packageJson from '../../package.json';

import { inject, injectable } from 'inversify';
import { Options } from './options';
import { Auth } from './auth/auth';
import { Logger } from './utils/logger';
import { API } from './api';
import { Projects } from './projects';
import mainMenuPrompt from './prompts/mainMenu.prompt';

@injectable()
export class Eclipse {
    public suppressError = false;

    constructor(
        @inject('Options') private options: Options,
        @inject('Auth') private auth: Auth,
        @inject('Logger') private logger: Logger,
        @inject('API') private _api: API,
        @inject('Projects') private projects: Projects
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

        const showVersion: boolean = argv.v || argv.version;
        if (showVersion) {
            this.showToolVersion();
            return true;
        }

        const showHelp: boolean = argv.h || argv.help;
        if (showHelp) {
            this.showHelpLog();
            return true;
        }

        const { inject, _: postArguments } = argv;

        const requiresRestart = await this.auth.checkIfAuthFlowRequired();

        if (requiresRestart) return true;

        await this._api.Initialize();

        this.logger.verticalSeparator();

        const isInProjectDirectory =
            await this.projects.checkIfOnProjectDirectory();

        if (isInProjectDirectory && inject) {
            const [coreProcess, ...processArgs] = postArguments;
            await this.projects.injectLocalProjectSecrets(
                coreProcess,
                processArgs
            );
            return true;
        }

        if (isInProjectDirectory) await this.projects.projectDirectoryMenu();
        if (!isInProjectDirectory) await this.showTopLevelMenu();

        return true;
    }

    private async showTopLevelMenu() {
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
