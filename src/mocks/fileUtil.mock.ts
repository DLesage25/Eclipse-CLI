interface KeyValues {
    [key: string]: string | number;
}

export class FileUtilMock {
    private FILE_PATH: string;
    constructor(filePath: string) {
        this.FILE_PATH = filePath;
    }

    public async find(): Promise<boolean> {
        return true;
    }

    public async writeFile(data: string): Promise<boolean> {
        return true;
    }

    public async createOrUpdate(data: KeyValues): Promise<boolean> {
        return true;
    }

    public async read(): Promise<string> {
        return '';
    }

    public async readIntoObject<T>(): Promise<T | Record<string, unknown>> {
        return {};
    }

    public async replaceOnFile(update: KeyValues): Promise<boolean> {
        return true;
    }
}
