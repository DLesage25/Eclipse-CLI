import { Axios } from 'axios';
import { inject, injectable } from 'inversify';
import { Auth } from './auth/auth';
import { Project } from './types/Project.type';
import { FileUtil } from './utils/fileUtil';

@injectable()
export class API {
    private _http: Axios;
    constructor(@inject('AuthFile') private authFileUtil: FileUtil) {
        this._http = new Axios({
            baseURL: process.env.ECLIPSE_API_URL,
            headers: {
                Authorization: '',
            },
        });
    }

    public async Initialize() {
        const rawData = await this.authFileUtil.read();
        const { access_token } =
            this.authFileUtil.fileNotationToObject(rawData);

        this._http.interceptors.request.use((config) => {
            if (!config.headers) config.headers = {};

            config.headers[`Authorization`] = `Bearer ${access_token}`;
            return config;
        });
    }

    //TODO - implement get user by auth code (and add to web too)
    public async getUser() {
        return this._http
            .get('/users/email/daniellesage25@gmail.com')
            .then((res) => res.data);
    }

    public async getProjects(): Promise<Project[]> {
        return this._http.get('/projects/').then((res) => {
            return typeof res.data === 'string'
                ? JSON.parse(res.data)
                : res.data;
        });
    }
}
