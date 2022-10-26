export interface Secret {
    _id: string;
    name: string;
    createdAt: Date;
    classifiers: Array<string>;
    storage: string;
    format: string;
}

export interface RevealedSecret {
    _id: string;
    value: string;
    classifiers: Array<string>;
    aliases: Array<{
        alias: string;
        format: string;
    }>;
    created_at: string;
    storage: string;
    name: string;
}
