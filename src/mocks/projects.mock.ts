import { Project } from 'eclipse/types/Project.type';

export class ProjectsMock {
    public async projectSelection(): Promise<void | null> {
        return;
    }

    public async viewProjectSecrets(
        project: Project,
        classifiers?: string[] | undefined
    ): Promise<void> {
        return;
    }

    public async projectDirectoryMenu(): Promise<boolean> {
        return true;
    }

    public async checkIfOnProjectDirectory(): Promise<boolean> {
        return true;
    }

    public async getCurrentProjectSecrets(
        classifiers?: string[] | undefined
    ): Promise<{ [key: string]: string } | undefined> {
        return undefined;
    }

    public async injectLocalProjectSecrets(
        coreProcess: string,
        processArgs: string[],
        classifiers?: string[] | undefined
    ): Promise<void> {
        return;
    }
}
