import { inject, injectable } from 'inversify';
import { API } from './api';
import createSecretPrompt from './prompts/createSecret.prompt';
import deleteSecretPrompt from './prompts/deleteSecret.prompt';
import { Project } from './types/Project.type';
import { Logger } from './utils/logger';

@injectable()
export class Secrets {
    constructor(
        @inject('API') private _api: API,
        @inject('Logger') private logger: Logger
    ) {}

    public async addSecretFromMenu(project: Project) {
        const { name, value, rawClassifiers } = await createSecretPrompt();
        return this.addSecret(project, name, value, rawClassifiers);
    }

    public async removeSecretFromMenu(project: Project) {
        const { secret, confirm } = await deleteSecretPrompt(project.secrets);
        if (!confirm) {
            this.logger.message('Aborted.');
            return;
        }
        return this.removeSecret(secret);
    }

    public async addSecret(
        project: Project,
        name: string,
        value: string,
        rawClassifiers: string
    ) {
        const classifiers = rawClassifiers.split(',').filter((i) => i !== '');
        const { name: createdName } = await this._api.createSecret({
            projectId: project._id,
            name,
            value,
            classifiers,
        });
        this.logger.success(
            `Secret ${createdName} created under project ${project.name}.`
        );
        return;
    }

    public async getSecrets(project: Project, classifiers?: Array<string>) {
        const secrets = await this._api.getSecrets(project._id, classifiers);

        if (!secrets.length) {
            return;
        }

        const secretsWithName: { [key: string]: string } = secrets.reduce(
            (prev, secret) => {
                return {
                    ...prev,
                    [secret.name]: secret.value,
                };
            },
            {}
        );
        return secretsWithName;
    }

    public async removeSecret(secret: { _id: string; name: string }) {
        return this._api.deleteSecret(secret._id, secret.name);
    }
}
