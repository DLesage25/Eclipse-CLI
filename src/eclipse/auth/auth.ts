import { red } from 'kleur';
import * as crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { AuthFile } from './authFile';
import http from 'http';
import url from 'url';
import open from 'open';
import axios from 'axios';

const requestUserToken = (codeVerifier: string, code: string) => {
    return axios({
        method: 'POST',
        url: `${process.env.AUTH_DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH_CLIENT_ID as string,
            code_verifier: codeVerifier,
            code,
            redirect_uri: process.env.AUTH_CALLBACK_URL as string,
        }),
    })
        .then((res) => {
            console.log('axios response');
            console.log(res.data);
        })
        .catch((err) => console.error(err));
};

@injectable()
export class Auth {
    private codeVerifier: string;
    constructor(@inject('AuthFile') private authFile: AuthFile) {
        this.codeVerifier = this.createCodeVerifier();
    }

    public async initializeAuthFlow() {
        const codeChallenge = this.createCodeChallenge(this.codeVerifier);
        const authUrl = this.constructAuthUrl(codeChallenge, 'abc123'); //todo - store this in auth file
        this.createAuthServer();
        await this.openAuthPage(authUrl);
    }

    private base64URLEncode(str: Buffer) {
        return str
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private sha256(buffer: string) {
        return crypto.createHash('sha256').update(buffer).digest();
    }

    private createCodeVerifier() {
        return this.base64URLEncode(crypto.randomBytes(32));
    }

    private createCodeChallenge(verifier: string) {
        return this.base64URLEncode(this.sha256(verifier));
    }

    private createAuthServer() {
        return http
            .createServer(this.handleAuthResponse(this.codeVerifier))
            .listen(process.env.AUTH_SERVER_PORT, (err?: Error) => {
                if (err) {
                    console.log(
                        `Unable to start an HTTP server on port ${process.env.AUTH_SERVER_PORT}.`,
                        err
                    );
                }
            });
    }

    private handleAuthResponse =
        (codeVerifier: string) =>
        async (req: http.IncomingMessage, res: http.ServerResponse) => {
            if (!req.url) return;

            const urlQuery = url.parse(req.url, true).query;
            const { code, state, error, error_description } = urlQuery;

            // this validation was simplified for the example
            if (code && state) {
                res.write(`
                <html>
                <body>
                    <h1>LOGIN SUCCEEDED</h1>
                </body>
                </html>
                `);
            } else {
                res.write(`
                <html>
                <body>
                    <h1>LOGIN FAILED</h1>
                    <div>${error}</div>
                    <div>${error_description}
                </body>
                </html>
                `);
                return;
            }

            console.log({ code, verf: codeVerifier });

            await requestUserToken(codeVerifier, code as string);

            return res.end();
        };

    private constructAuthUrl(codeChallenge: string, state: string): string {
        return [
            `${process.env.AUTH_DOMAIN}/authorize`,
            `?response_type=code`,
            `&code_challenge_method=S256`,
            `&code_challenge=${codeChallenge}`,
            `&client_id=${process.env.AUTH_CLIENT_ID}`,
            `&redirect_uri=${process.env.AUTH_CALLBACK_URL as string}`,
            `&scope=email`,
            `&audience=http://api.tuple.com`,
            `&state=${state}`,
        ].join('');
    }

    private async openAuthPage(authUrl: string) {
        try {
            await open(authUrl, { wait: true, newInstance: true });
            return true;
        } catch (e) {
            console.log(red(`${e}`));
            return null;
        }
    }
}
