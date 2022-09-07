import axios, { Axios } from 'axios';
import { inject, injectable } from 'inversify';
import { CreateSecretDto } from './dtos/createSecret.dto';
import { Project } from './types/Project.type';
import { RevealedSecret } from './types/Secret.type';
import { fileNotationToObject, FileUtil } from './utils/fileUtil';

@injectable()
export class API {
    private _http: Axios;
    constructor(@inject('AuthFile') private authFileUtil: FileUtil) {
        this._http = axios.create({
            baseURL: process.env.ECLIPSE_API_URL,
            headers: {
                Authorization: '',
            },
        });
    }

    public async Initialize() {
        const rawData = await this.authFileUtil.read();
        const { access_token } = fileNotationToObject(rawData);

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
        return this._http.get('/projects/').then((res) => {
            return typeof res.data === 'string'
                ? JSON.parse(res.data)
                : res.data;
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
            .then((res) => res.data);
    }

    public async createSecret(createSecretDto: CreateSecretDto) {
        return this._http
            .post('/secrets', createSecretDto)
            .then((res) => res.data);
    }

    public async deleteSecret(secretId: string) {
        return this._http
            .delete(`/secrets/${secretId}`)
            .then((res) => res.data);
    }
}
