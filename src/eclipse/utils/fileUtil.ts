import { injectable } from 'inversify';
import { promises as fs } from 'fs';

interface KeyValues {
    [key: string]: string;
}

@injectable()
export class FileUtil {
    private FILE_PATH: string;
    constructor(filePath: string) {
        this.FILE_PATH = filePath;
    }

    public async find() {
        try {
            const stats = await fs.stat(this.FILE_PATH);
            if (stats) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    public async writeFile(data: string) {
        try {
            return fs.writeFile(this.FILE_PATH, data).then(() => true);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async createOrUpdate(data: KeyValues) {
        const exists = await this.find();

        if (exists) {
            return this.replaceOnFile(data);
        }

        const fileData = this.objectToFileNotation(data);
        return this.writeFile(fileData);
    }

    public async read() {
        try {
            return fs.readFile(this.FILE_PATH).then((res) => res.toString());
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    public async replaceOnFile(update: KeyValues) {
        try {
            const rawData = await this.read();
            const fileData = this.fileNotationToObject(rawData);

            const updatedFileData = { ...fileData, ...update };

            const updateRawData = this.objectToFileNotation(updatedFileData);

            return this.writeFile(updateRawData);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public fileNotationToObject(fileData: string): KeyValues {
        const keyValArray = fileData.split('\n').filter((i) => i !== '');

        return keyValArray.reduce((prev, current) => {
            const keyVal = current.split('=');
            return { ...prev, [keyVal[0]]: keyVal[1] };
        }, {});
    }

    public objectToFileNotation(keyValues: KeyValues) {
        const kv = { ...keyValues };
        let formattedString = '';

        for (const key in kv) {
            formattedString += `${key}=${kv[key]}\n`;
        }
        return formattedString;
    }
}
