import * as crypto from 'crypto';
import { inject, injectable } from 'inversify';
import http from 'http';
import url from 'url';
import open from 'open';
import axios from 'axios';
import { fileNotationToObject, objectToFileNotation } from '../utils/fileUtil';
import { Logger } from '../utils/logger';
import { KeyChain } from '../keychain';
import { CoreConfig } from '../types/CoreConfig.type';

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
            const { access_token, expires_in } = res.data;
            return { access_token, expires_in };
        })
        .catch((err) => {
            throw new Error('Error attempting to request user token - ' + err);
        });
};

@injectable()
export class Auth {
    private codeVerifier: string;
    private coreConfig: CoreConfig | null;
    constructor(
        @inject('KeyChain') private keyChain: KeyChain,
        @inject('Logger') private logger: Logger
    ) {
        this.codeVerifier = this.createCodeVerifier();
        this.coreConfig = null;
    }

    public async checkIfAuthFlowRequired() {
        const rawCoreConfig = await this.keyChain.getKey('eclipse', 'core');

        if (!rawCoreConfig) return this.initializeAuthFlow();

        this.coreConfig = fileNotationToObject<CoreConfig>(rawCoreConfig);

        const tokenExpired = await this.checkIfTokenExpired();

        if (tokenExpired) return this.initializeAuthFlow();

        this.logger.success('Session restored. Welcome back!');

        return;
    }

    public async initializeAuthFlow() {
        const codeChallenge = this.createCodeChallenge(this.codeVerifier);
        const authUrl = this.constructAuthUrl(codeChallenge, 'abc123');
        this.createAuthServer();
        await this.openAuthPage(authUrl);

        this.logger.success('You are now logged in!');

        return;
    }

    public async getConfig(): Promise<CoreConfig | null> {
        const rawData = await this.keyChain.getKey('eclipse', 'core');

        if (!rawData) return null;

        const config = fileNotationToObject<CoreConfig>(rawData);
        return config;
    }

    private async checkIfTokenExpired() {
        const { expiration_date } = this.coreConfig as CoreConfig;

        if (expiration_date && Number(expiration_date) <= Date.now()) {
            return true;
        }
        return false;
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
            .createServer(
                this.handleAuthResponse(
                    this.codeVerifier,
                    this.keyChain,
                    this.logger
                )
            )
            .listen(process.env.AUTH_SERVER_PORT, (err?: Error) => {
                if (err) {
                    this.logger.error(
                        `Unable to start an HTTP server on port ${process.env.AUTH_SERVER_PORT}: ${err}`
                    );
                }
            });
    }

    private constructAuthUrl(codeChallenge: string, state: string): string {
        return [
            `${process.env.AUTH_DOMAIN}/authorize`,
            `?response_type=code`,
            `&code_challenge_method=S256`,
            `&code_challenge=${codeChallenge}`,
            `&client_id=${process.env.AUTH_CLIENT_ID}`,
            `&redirect_uri=${process.env.AUTH_CALLBACK_URL}`,
            `&scope=email`,
            `&audience=${process.env.AUTH_TARGET_AUDIENCE}`,
            `&state=${state}`,
        ].join('');
    }

    private async openAuthPage(authUrl: string) {
        try {
            await open(authUrl, { wait: true, newInstance: true });
            return;
        } catch (err) {
            this.logger.error(
                `Error attempting to open authentication page in browser: ${err}`
            );
            return;
        }
    }

    private handleAuthResponse =
        (codeVerifier: string, keychain: KeyChain, logger: Logger) =>
        async (req: http.IncomingMessage, res: http.ServerResponse) => {
            if (!req.url) return;

            const urlQuery = url.parse(req.url, true).query;
            const { code, state, error, error_description } = urlQuery;

            // TODO - generate state based on user email and validate here
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
            try {
                const { access_token, expires_in } = await requestUserToken(
                    codeVerifier,
                    code as string
                );

                //expires_in = seconds
                const expiration_date = (
                    Date.now() +
                    expires_in * 1000
                ).toString();

                const fileFormat = objectToFileNotation({
                    access_token,
                    expiration_date,
                });

                keychain.setKey('eclipse', 'core', fileFormat);

                return res.end();
            } catch (err) {
                logger.error(`Error attempting to save access token: ${err}`);
            }
        };
}
