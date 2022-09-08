import { injectable } from 'inversify';
import { red, green, yellow, dim, default as kleur } from 'kleur';
import figlet from 'figlet';

// eslint-disable-next-line
kleur.enabled = require('color-support').level;

@injectable()
export class Logger {
    public verticalSeparator() {
        console.log('\n\n');
    }

    public message(msg: string) {
        console.log(dim(msg));
        return;
    }

    public success(msg: string) {
        console.log(green(msg));
        return;
    }

    public warning(msg: string) {
        console.warn(yellow(msg));
        return;
    }

    public error(msg: string) {
        console.error(red(msg));
        return;
    }

    public banner(msg: string, options: any) {
        console.log(yellow(figlet.textSync(msg, options)));
        return;
    }
}
