import { injectable } from 'inversify';
import { promises as fs } from 'fs';

interface KeyValues {
    [key: string]: string | number | boolean | Record<string, any>;
}

@injectable()
export class FileUtil {
    private FILE_PATH: string;
    constructor(filePath: string) {
        this.FILE_PATH = filePath;
    }

    //TODO - this still shows an ugly console error even if wrapped in a t/c clause
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

        const fileData = objectToFileNotation(data);
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

    public async readIntoObject<T>() {
        try {
            const raw = await this.read();
            return fileNotationToObject<T>(raw);
        } catch (e) {
            console.error(`Error reading file into object ${e}`);
            return {};
        }
    }

    public async replaceOnFile(update: KeyValues) {
        try {
            const rawData = await this.read();
            const fileData = fileNotationToObject<KeyValues>(rawData);

            const updatedFileData = { ...fileData, ...update };

            const updateRawData = objectToFileNotation(updatedFileData);

            return this.writeFile(updateRawData);
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export const fileNotationToObject = <T>(fileData: string): T => {
    const keyValArray = fileData.split('\n').filter((i) => i !== '');

    return keyValArray.reduce((prev, current) => {
        const keyVal = current.split('=');
        const value = keyVal[1];
        const formattedValue = !isNaN(+value)
            ? +value
            : value === 'true' || value === 'false' || hasJsonStructure(value)
            ? JSON.parse(value)
            : value;

        return { ...prev, [keyVal[0]]: formattedValue };
    }, {}) as T;
};

export const objectToFileNotation = (keyValues: object) => {
    const kv = { ...keyValues };
    let formattedString = '';

    for (const key in kv) {
        formattedString += `${key}=${kv[key]}\n`;
    }
    return formattedString;
};

const hasJsonStructure = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
        return false;
    }
};
