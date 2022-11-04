import axios, { Axios } from 'axios';
import { User } from 'eclipse/types/User.type';
import { inject, injectable } from 'inversify';

import Auth from '../auth/auth';
import CoreConfigModule from '../coreConfig';

import { CreateSecretDto } from '../dtos/createSecret.dto';
import { ApiConfig } from '../types/CoreConfig.type';
import { Project } from '../types/Project.type';
import { RevealedSecret, Secret } from '../types/Secret.type';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types/ApiResponse.type';

@injectable()
export default class API {
    private _http: Axios;
    constructor(
        @inject('Auth') private auth: Auth,
        @inject('Logger') private logger: Logger,
        @inject('CoreConfig') private coreConfig: CoreConfigModule
    ) {
        this._http = axios.create({
            baseURL: process.env.ECLIPSE_API_URL,
            headers: {
                Authorization: `Bearer ${process.env.ECLIPSE_CLI_KEY}`,
            },
        });
    }

    public async Initialize() {
        const config = await this.auth.getConfig();
        const coreConfig = await this.coreConfig.get();

        if (!config || !coreConfig) {
            this.logger.error(
                'Could not initialize API. Auth or core config not found'
            );
            return;
        }

        const { access_token } = config;

        this._http.interceptors.request.use((config) => {
            if (!config.headers) config.headers = {};

            config.headers[`Authorization`] = `Bearer ${access_token}`;
            return config;
        });
    }

    public async getCliValues(): Promise<ApiConfig> {
        return this._http.post('/cli').then((res) => res.data);
    }

    public async getUser(): Promise<User | null> {
        return this._http
            .get('/users')
            .then((res) => {
                const result: ApiResponse<User> = res.data;
                return result.payload;
            })
            .catch(() => {
                this.logger.error('Error when fetching user.');
                return null;
            });
    }

    public async getProjects(projectId?: string): Promise<Project[]> {
        const opts = projectId
            ? {
                  params: {
                      projectId,
                  },
              }
            : undefined;

        return this._http
            .get('/projects', opts)
            .then((res) => {
                const { payload, statusCode, message }: ApiResponse<Project> =
                    res.data;

                if (statusCode !== 200) {
                    throw new Error(message);
                }

                return typeof payload === 'string'
                    ? JSON.parse(payload)
                    : payload;
            })
            .catch((err) => {
                this.logger.error(
                    `Error when attempting to fetch projects: ${err}`
                );
                return [];
            });
    }

    public async getSecrets(
        projectId: string,
        classifiers?: Array<string>
    ): Promise<RevealedSecret[]> {
        return this._http
            .get('/secrets/reveal', {
                data: {
                    project: {
                        _id: projectId,
                    },
                    classifiers,
                },
            })
            .then((res) => {
                const {
                    payload,
                    statusCode,
                    message,
                }: ApiResponse<RevealedSecret[]> = res.data;

                if (statusCode !== 200) {
                    throw new Error(message);
                }

                return payload;
            })
            .catch((err) => {
                this.logger.error(`Error attempting to fetch secrets: ${err}`);
                return [];
            });
    }

    public async createSecret(createSecretDto: CreateSecretDto) {
        return this._http
            .post('/secrets', createSecretDto)
            .then((res) => {
                const { payload, statusCode, message }: ApiResponse<Secret> =
                    res.data;

                if (statusCode !== 200) {
                    throw new Error(message);
                }

                return payload;
            })
            .catch((err) => {
                this.logger.error(`Error attempting to create secret: ${err}`);
                return null;
            });
    }

    public async deleteSecret(secretId: string, secretName: string) {
        return this._http
            .delete(`/secrets/${secretId}`)
            .then(() => {
                this.logger.success(
                    `Secret ${secretName} successfully deleted.`
                );
                return;
            })
            .catch((err) => {
                this.logger.error(`Error attempting to delete secret: ${err}`);
                return null;
            });
    }
}
