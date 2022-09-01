import * as packageJson from '../../package.json';
import { cyan } from 'kleur';
import { injectable } from 'inversify';

const program = require('commander');

@injectable()
export class Options {
    constructor() {}

    public showOptions(): void {
        return program
            .version(packageJson.version)
            .description(cyan('Inject environment variables on runtime'))
            .option('--debug', 'Show debug info')
            .outputHelp();
    }
}
