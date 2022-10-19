import * as packageJson from '../../package.json';
import program from 'commander';
import { cyan } from 'kleur';
import { injectable } from 'inversify';

@injectable()
export class Options {
    public showOptions(): void {
        return program
            .version(packageJson.version)
            .add.description(cyan('Inject environment variables on runtime'))
            .option(
                'inject <classifiers> <command>',
                'Inject project secrets into the execution context. Classifiers can be "all" or a comma-separated list of classifiers.'
            )
            .option(
                '--init',
                'Initialize the CLI and populate all required variables to communicate with Eclipse web.'
            )
            .outputHelp();
    }
}
