import { Axios } from 'axios';
import { inject, injectable } from 'inversify';
import { Auth } from './auth/auth';
import { FileUtil } from './utils/fileUtil';

@injectable()
export class API {
    private _http?: Axios;
    constructor(@inject('AuthFile') private authFileUtil: FileUtil) {}

    public async Initialize() {
        const rawData = await this.authFileUtil.read();
        const { access_token } =
            this.authFileUtil.fileNotationToObject(rawData);

        this._http = new Axios({
            baseURL: process.env.ECLIPSE_API_URL,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    }

    public async getUser() {}
}
