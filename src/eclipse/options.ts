import * as packageJson from '../../package.json';
import program from 'commander';
import { cyan } from 'kleur';
import { injectable } from 'inversify';

@injectable()
export class Options {
    public showOptions(): void {
        return program
            .version(packageJson.version)
            .description(cyan('Inject environment variables on runtime'))
            .option('--debug', 'Show debug info')
            .outputHelp();
    }
}
