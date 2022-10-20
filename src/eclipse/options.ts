import * as packageJson from '../../package.json';
import { Command } from 'commander';
import { cyan } from 'kleur';
import { injectable } from 'inversify';

@injectable()
export class Options {
    public showOptions(): void {
        const program = new Command();
        return program
            .description(cyan('Inject environment variables on runtime'))
            .version(packageJson.version, 'v, version')
            .helpOption('h, help', 'Show the help log')
            .option(
                'i, inject <classifiers> <command>',
                'Inject project secrets into an execution context. Classifiers can be "all" or comma-separated values.'
            )
            .option(
                'a, add <secretname> <secretvalue> <classifiers>',
                'Create a secret under the working project directory. Classifiers must be comma-separated.'
            )
            .addHelpText(
                'after',
                `
            
            Examples - secret injection: 

            Injecting all secrets unto a Node REPL:
            $ eclipse inject all node

            Injecting only staging secrets unto a build:
            $ eclipse i staging npm start

            Inject secrets that have the staging and web classifier unto a build:
            $ eclipse i staging,web npm start

            Examples - creating secrets:

            Creating a secret with a single classifier:
            $ eclipse add my_secret "SECRET_HASH_123" production  
            
            Creating a secret with multiple classifiers:
            $ eclipse add my_secret "SECRET_HASH_345" backend,production

            `
            )
            .outputHelp();
    }
}
