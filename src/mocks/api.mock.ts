import api from 'eclipse/api';
import { CreateSecretDto } from 'eclipse/dtos/createSecret.dto';
import { ApiConfig } from 'eclipse/types/CoreConfig.type';
import { Project } from 'eclipse/types/Project.type';
import { RevealedSecret } from 'eclipse/types/Secret.type';

export class ApiMock {
    public async Initialize(): Promise<void> {
        return;
    }

    public async getCliValues(): Promise<ApiConfig> {
        return {} as ApiConfig;
    }

    public async getUser(): Promise<any> {
        return;
    }

    public async getProjects(
        projectId?: string | undefined
    ): Promise<Project[]> {
        return [];
    }

    public async getSecrets(
        projectId: string,
        classifiers?: string[] | undefined
    ): Promise<RevealedSecret[]> {
        return [];
    }

    public async createSecret(createSecretDto: CreateSecretDto): Promise<any> {
        return;
    }

    public async deleteSecret(
        secretId: string,
        secretName: string
    ): Promise<void | null> {
        return;
    }
}
