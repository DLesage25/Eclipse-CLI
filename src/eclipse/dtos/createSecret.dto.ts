export interface CreateSecretDto {
    value: string;
    projectId: string;
    name: string;
    classifiers: Array<string>;
}
