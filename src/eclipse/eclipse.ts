import 'reflect-metadata';
import minimist from 'minimist';
import * as packageJson from '../../package.json';
import { red, green, default as kleur } from 'kleur';

import { inject, injectable } from 'inversify';
import { Options } from './options';
import { Auth } from './auth/auth';

const figlet = require('figlet');

kleur.enabled = require('color-support').level;

@injectable()
export class Eclipse {
    public suppressError: boolean = false;

    constructor(
        @inject('Options') private options: Options,
        @inject('Auth') private auth: Auth
    ) {
        try {
            this.execute()
                .then((success) => {
                    this.showSpacesLog();
                    if (!success && !this.suppressError) {
                        process.exit(1);
                    }
                })
                .catch((err) => console.error(err));
        } catch (error) {
            if (error instanceof Error) {
                console.log(red(error.message));
            } else {
                console.log(red(`${error}`));
            }
            if (!this.suppressError) {
                process.exit(1);
            }
        }
    }

    public async execute(): Promise<boolean> {
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

        if (projectInput === undefined && !showHelp && !showVersion) {
            console.error(
                red(
                    'Unknown command, run eclipse -h or eclipse --help for a list of commands.'
                )
            );
            return false;
        }

        this.auth.initializeAuthFlow();

        return true;
    }

    private showIntroLog(): void {
        console.log(figlet.textSync('EclipseJS', { horizontalLayout: 'full' }));
        console.log(green(`Inject environment variables on runtime.`));
    }

    private showToolVersion(): void {
        console.log(`Version: ${packageJson.version}`);
    }

    private showHelpLog(): void {
        this.options.showOptions();
    }

    private showSpacesLog(): void {
        console.log('');
        console.log('');
        console.log('');
    }
}
