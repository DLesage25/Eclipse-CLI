export interface Secret {
    _id: string;
    name: string;
    createdAt: Date;
    classifiers: Array<string>;
    storage: string;
    format: string;
}
