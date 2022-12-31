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

    public async find(typeSuffix?: string) {
        const fileName = typeSuffix
            ? `${this.FILE_PATH}.${typeSuffix}`
            : this.FILE_PATH;

        try {
            const stats = await fs.stat(fileName);
            if (stats) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    public async writeFile(data: string, typeSuffix?: string) {
        const fileName = typeSuffix
            ? `${this.FILE_PATH}.${typeSuffix}`
            : this.FILE_PATH;

        try {
            return fs.writeFile(fileName, data).then(() => true);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async createOrUpdate({
        data,
        fileComment,
        typeSuffix,
    }: {
        data: KeyValues;
        fileComment?: string;
        typeSuffix?: string;
    }): Promise<boolean> {
        const exists = await this.find(typeSuffix);

        if (exists) {
            return this.replaceOnFile(data);
        }

        const fileNotation = objectToFileNotation(data);
        const fileData = fileComment
            ? `${fileComment}\n${fileNotation}`
            : fileNotation;
        return this.writeFile(fileData, typeSuffix);
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
