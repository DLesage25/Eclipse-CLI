import axios, { Axios } from 'axios';
import { inject, injectable } from 'inversify';
import { Auth } from './auth/auth';
import { CreateSecretDto } from './dtos/createSecret.dto';
import { Project } from './types/Project.type';
import { RevealedSecret } from './types/Secret.type';
import { Logger } from './utils/logger';

@injectable()
export class API {
    private _http: Axios;
    constructor(
        @inject('Auth') private auth: Auth,
        @inject('Logger') private logger: Logger
    ) {
        this._http = axios.create({
            baseURL: process.env.ECLIPSE_API_URL,
            headers: {
                Authorization: '',
            },
        });
    }

    public async Initialize() {
        const config = await this.auth.getConfig();

        if (!config) {
            this.logger.error('Could not initialize API. Config not found');
            return;
        }

        const { access_token } = config;

        this._http.interceptors.request.use((config) => {
            if (!config.headers) config.headers = {};

            config.headers[`Authorization`] = `Bearer ${access_token}`;
            return config;
        });
    }

    public async getUser() {
        return this._http.get('/users/').then((res) => res.data);
    }

    public async getProjects(): Promise<Project[]> {
        return this._http
            .get('/projects/')
            .then((res) => {
                return typeof res.data === 'string'
                    ? JSON.parse(res.data)
                    : res.data;
            })
            .catch((err) => {
                this.logger.error(
                    `Error when attempting to fetch projects: ${err}`
                );
                return [];
            });
    }

    public async getSecrets(projectId: string): Promise<RevealedSecret[]> {
        return this._http
            .get('/secrets/reveal', {
                data: {
                    project: {
                        _id: projectId,
                    },
                },
            })
            .then((res) => res.data)
            .catch((err) => {
                this.logger.error(`Error attempting to fetch secrets: ${err}`);
                return [];
            });
    }

    public async createSecret(createSecretDto: CreateSecretDto) {
        return this._http
            .post('/secrets', createSecretDto)
            .then((res) => res.data)
            .catch((err) => {
                this.logger.error(`Error attempting to create secret: ${err}`);
                return null;
            });
    }

    public async deleteSecret(secretId: string) {
        return this._http
            .delete(`/secrets/${secretId}`)
            .then((res) => {
                this.logger.success(
                    `Secret ${res.data._id} successfully deleted.`
                );
                return;
            })
            .catch((err) => {
                this.logger.error(`Error attempting to delete secret: ${err}`);
                return null;
            });
    }
}
