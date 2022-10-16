interface KeyValues {
    [key: string]: string;
}
export declare class FileUtil {
    private FILE_PATH;
    constructor(filePath: string);
    find(): Promise<boolean>;
    writeFile(data: string): Promise<boolean>;
    createOrUpdate(data: KeyValues): Promise<boolean>;
    read(): Promise<string>;
    readIntoObject<T>(): Promise<{}>;
    replaceOnFile(update: KeyValues): Promise<boolean>;
}
export declare const fileNotationToObject: <T>(fileData: string) => T;
export declare const objectToFileNotation: (keyValues: object) => string;
export {};
