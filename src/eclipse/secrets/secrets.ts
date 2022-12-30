import { DeleteSecretDto } from 'eclipse/dtos/deleteSecret.dto';
import { inject, injectable } from 'inversify';
import API from '../api';
import createSecretPrompt from '../prompts/createSecret.prompt';
import deleteSecretPrompt from '../prompts/deleteSecret.prompt';
import { Project } from '../types/Project.type';
import { RevealedSecret } from '../types/Secret.type';
import { Logger } from '../utils/logger';

@injectable()
export default class Secrets {
    constructor(
        @inject('API') private _api: API,
        @inject('Logger') private logger: Logger
    ) {}

    public async addSecretFromMenu(project: Project) {
        const { name, value, environment, component } =
            await createSecretPrompt();
        return this.addSecret(project, name, value, environment, component);
    }

    public async removeSecretFromMenu(project: Project) {
        const { secret, confirm } = await deleteSecretPrompt(project.secrets);
        if (!confirm) {
            this.logger.message('Aborted.');
            return;
        }
        return this.removeSecret({
            secretId: secret._id,
            secretName: secret.name,
        });
    }

    public async addSecret(
        project: Project,
        name: string,
        value: string,
        component: string,
        environment: string
    ) {
        const createdSecret = await this._api.createSecret({
            projectId: project._id,
            ownerId: project.ownerId,
            name,
            value,
            environment,
            component,
        });

        if (!createdSecret) return;

        this.logger.success(
            `Secret ${createdSecret.name} created under project ${project.name}.`
        );

        return;
    }

    public async getPartialSecrets(
        project: Project,
        component: string,
        environment: string
    ): Promise<void | { [key: string]: string }> {
        const secrets = await this._api.getSecrets({
            projectId: project._id,
            ownerId: project.ownerId,
            component,
            environment,
        });

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

    public async getFullSecrets(
        project: Project,
        component: string,
        environment: string
    ): Promise<void | { [key: string]: RevealedSecret }> {
        const secrets = await this._api.getSecrets({
            projectId: project._id,
            ownerId: project.ownerId,
            component,
            environment,
        });

        if (!secrets.length) {
            return;
        }

        const secretsWithName: { [key: string]: RevealedSecret } =
            secrets.reduce((prev, secret) => {
                return {
                    ...prev,
                    [secret.name]: { ...secret },
                };
            }, {});
        return secretsWithName;
    }

    public async removeSecret(deleteSecretDto: DeleteSecretDto) {
        return this._api.deleteSecret(deleteSecretDto);
    }
}
