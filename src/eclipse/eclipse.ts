import 'reflect-metadata';
import minimist from 'minimist';
import * as packageJson from '../../package.json';

import { inject, injectable } from 'inversify';
import { Options } from './options';
import { Auth } from './auth/auth';
import { Logger } from './utils/logger';
import { API } from './api';
import { Projects } from './projects';

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

        const argv = minimist(process.argv.slice(2), { '--': true });
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

        let projectInput: string = argv.p || argv.project;

        if (projectInput === undefined && argv._.length === 0) {
            projectInput = '.';
        }

        //TODO this will never run because of the statement above.
        if (projectInput === undefined && !showHelp && !showVersion) {
            this.logger.error(
                'Unknown command, run eclipse -h or eclipse --help for a list of commands.'
            );
            return false;
        }

        await this.auth.checkIfAuthFlowRequired();
        await this._api.Initialize();

        this.logger.verticalSeparator();

        await this.projects.projectSelection();

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
