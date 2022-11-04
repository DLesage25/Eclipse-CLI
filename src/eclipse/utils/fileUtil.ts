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

    public async createOrUpdate(
        data: KeyValues,
        fileComment?: string
    ): Promise<boolean> {
        const exists = await this.find();

        if (exists) {
            return this.replaceOnFile(data);
        }

        const fileNotation = objectToFileNotation(data);
        const fileData = fileComment
            ? `${fileComment}\n${fileNotation}`
            : fileNotation;
        return this.writeFile(fileData);
    }

    public async read(): Promise<string> {
        try {
            return fs.readFile(this.FILE_PATH).then((res) => res.toString());
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    public async readIntoObject<T>(
        containsComment?: boolean
    ): Promise<T | null> {
        try {
            const rawData = await this.read();
            const commentRemoved = containsComment
                ? rawData.split('\n').slice(1).join('\n')
                : rawData;
            return fileNotationToObject<T>(commentRemoved);
        } catch (e) {
            console.error(`Error reading file into object ${e}`);
            return null;
        }
    }

    public async replaceOnFile(update: KeyValues): Promise<boolean> {
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
