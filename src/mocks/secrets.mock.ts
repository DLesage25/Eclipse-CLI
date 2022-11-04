import { Project } from 'eclipse/types/Project.type';
import { RevealedSecret, Secret } from 'eclipse/types/Secret.type';

export class SecretsMock {
    public async addSecretFromMenu(project: Project): Promise<void> {
        return;
    }

    public async removeSecretFromMenu(project: Project): Promise<void | null> {
        return;
    }

    public async addSecret(
        project: Project,
        name: string,
        value: string,
        rawClassifiers: string
    ): Promise<void> {
        return;
    }

    public async getPartialSecrets(
        project: Project,
        classifiers?: string[] | undefined,
        includeAllProperties?: boolean | undefined
    ): Promise<void | { [key: string]: string }> {
        return;
    }

    public async getFullSecrets(
        project: Project,
        classifiers?: string[] | undefined
    ): Promise<void | { [key: string]: RevealedSecret }> {
        return;
    }

    public async removeSecret(secret: {
        _id: string;
        name: string;
    }): Promise<void | null> {
        return;
    }
}
