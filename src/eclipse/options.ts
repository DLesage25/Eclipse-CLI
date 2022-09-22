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
            .option(
                '--all',
                'Inject environment variables into the execution context (make sure you are inside a project folder with an .eclipserc on it).'
            )
            .outputHelp();
    }
}
