import { injectable } from 'inversify';
import fs from 'fs';
import os from 'os';

const AUTH_FILE_PATH = `${os.homedir()}/.eclipserc`;

@injectable()
export class AuthFile {
    constructor() {}

    public find() {
        try {
            if (fs.existsSync(AUTH_FILE_PATH)) {
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public createOrUpdate() {
        try {
            fs.writeFileSync(AUTH_FILE_PATH, 'AUTH_CODE=asdadasdadsads');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public read() {
        try {
            const authFile = fs.readFileSync(AUTH_FILE_PATH);
            return authFile;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}
