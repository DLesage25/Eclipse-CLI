export interface CreateSecretDto {
    name: string;
    value: string;
    environment: string;
    component: string;
    projectId: string;
    ownerId: string;
}
