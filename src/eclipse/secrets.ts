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

    public async addSecret(project: Project) {
        const { name, value, rawClassifiers } = await createSecretPrompt();
        const classifiers = rawClassifiers.split(' ');
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

    public async removeSecret(project: Project) {
        const { secretId, confirm } = await deleteSecretPrompt(project.secrets);
        if (!confirm) {
            this.logger.message('Cancelled.');
        }
        return this._api.deleteSecret(secretId);
    }
}
