import * as crypto from 'crypto';
import { inject, injectable } from 'inversify';
import http, { Server } from 'http';
import url from 'url';
import open from 'open';
import axios from 'axios';
import { fileNotationToObject, objectToFileNotation } from '../utils/fileUtil';
import { Logger } from '../utils/logger';
import { KeyChain } from '../keychain';
import { AuthConfig } from '../types/AuthConfig.type';
import { CoreConfigModule } from '../coreConfig';

const requestUserToken = (
    codeVerifier: string,
    code: string,
    serverConfig: ServerConfig
) => {
    return axios({
        method: 'POST',
        url: `${serverConfig.ECLIPSE_AUTH_DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: serverConfig.ECLIPSE_AUTH_CLIENT_ID,
            code_verifier: codeVerifier,
            code,
            redirect_uri: serverConfig.ECLIPSE_AUTH_CALLBACK_URL,
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

interface ServerConfig {
    ECLIPSE_AUTH_DOMAIN: string;
    ECLIPSE_AUTH_CLIENT_ID: string;
    ECLIPSE_AUTH_CALLBACK_URL: string;
    ECLIPSE_AUTH_SERVER_PORT: number;
}

interface AuthUrlConfig {
    ECLIPSE_AUTH_TARGET_AUDIENCE: string;
    ECLIPSE_AUTH_CLIENT_ID: string;
    ECLIPSE_AUTH_CALLBACK_URL: string;
    ECLIPSE_AUTH_DOMAIN: string;
}

@injectable()
export class Auth {
    private codeVerifier: string;
    private authConfig: AuthConfig | null;
    constructor(
        @inject('KeyChain') private keyChain: KeyChain,
        @inject('Logger') private logger: Logger,
        @inject('CoreConfig') private coreConfig: CoreConfigModule
    ) {
        this.codeVerifier = this.createCodeVerifier();
        this.authConfig = null;
    }

    public async checkIfAuthFlowRequired(): Promise<boolean> {
        const rawAuthConfig = await this.keyChain.getKey('eclipse', 'auth');

        if (!rawAuthConfig) return this.initializeAuthFlow();

        this.authConfig = fileNotationToObject<AuthConfig>(rawAuthConfig);

        const tokenExpired = await this.checkIfTokenExpired();

        if (tokenExpired) return this.initializeAuthFlow();

        this.logger.success('Session restored. Welcome back!');

        return false;
    }

    public async initializeAuthFlow(): Promise<boolean> {
        const codeChallenge = this.createCodeChallenge(this.codeVerifier);
        const coreConfig = await this.coreConfig.get();

        if (!coreConfig) {
            this.logger.error('Core config missing. Please run eclipse --init');
            return false;
        }

        const {
            ECLIPSE_AUTH_DOMAIN,
            ECLIPSE_AUTH_CLIENT_ID,
            ECLIPSE_AUTH_CALLBACK_URL,
            ECLIPSE_AUTH_SERVER_PORT,
            ECLIPSE_AUTH_TARGET_AUDIENCE,
        } = coreConfig;

        this.createAuthServer({
            ECLIPSE_AUTH_DOMAIN,
            ECLIPSE_AUTH_CLIENT_ID,
            ECLIPSE_AUTH_CALLBACK_URL,
            ECLIPSE_AUTH_SERVER_PORT,
        });

        const authUrl = this.constructAuthUrl(codeChallenge, 'abc123', {
            ECLIPSE_AUTH_DOMAIN,
            ECLIPSE_AUTH_CLIENT_ID,
            ECLIPSE_AUTH_TARGET_AUDIENCE,
            ECLIPSE_AUTH_CALLBACK_URL,
        });
        await this.openAuthPage(authUrl);

        this.logger.success(
            'You are now logged in! Please hit control+C and run eclipse again in your terminal.'
        );

        return true;
    }

    public async getConfig(): Promise<AuthConfig | null> {
        const rawData = await this.keyChain.getKey('eclipse', 'auth');

        if (!rawData) return null;

        const config = fileNotationToObject<AuthConfig>(rawData);
        return config;
    }

    private async checkIfTokenExpired(): Promise<boolean> {
        const { expiration_date } = this.authConfig as AuthConfig;

        if (expiration_date && Number(expiration_date) <= Date.now()) {
            return true;
        }
        return false;
    }

    private base64URLEncode(str: Buffer): string {
        return str
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private sha256(buffer: string) {
        return crypto.createHash('sha256').update(buffer).digest();
    }

    private createCodeVerifier(): string {
        return this.base64URLEncode(crypto.randomBytes(32));
    }

    private createCodeChallenge(verifier: string): string {
        return this.base64URLEncode(this.sha256(verifier));
    }

    private createAuthServer(serverConfig: ServerConfig): Server {
        return http
            .createServer(
                this.handleAuthResponse(
                    this.codeVerifier,
                    this.keyChain,
                    this.logger,
                    serverConfig
                )
            )
            .listen(serverConfig.ECLIPSE_AUTH_SERVER_PORT, (err?: Error) => {
                if (err) {
                    this.logger.error(
                        `Unable to start an HTTP server on port ${serverConfig.ECLIPSE_AUTH_SERVER_PORT}: ${err}`
                    );
                }
            });
    }

    private constructAuthUrl(
        codeChallenge: string,
        state: string,
        authUrlConfig: AuthUrlConfig
    ): string {
        return [
            `${authUrlConfig.ECLIPSE_AUTH_DOMAIN}/authorize`,
            `?response_type=code`,
            `&code_challenge_method=S256`,
            `&code_challenge=${codeChallenge}`,
            `&client_id=${authUrlConfig.ECLIPSE_AUTH_CLIENT_ID}`,
            `&redirect_uri=${authUrlConfig.ECLIPSE_AUTH_CALLBACK_URL}`,
            `&scope=email`,
            `&audience=${authUrlConfig.ECLIPSE_AUTH_TARGET_AUDIENCE}`,
            `&state=${state}`,
        ].join('');
    }

    private async openAuthPage(authUrl: string): Promise<void> {
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
        (
            codeVerifier: string,
            keychain: KeyChain,
            logger: Logger,
            serverConfig: ServerConfig
        ) =>
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
                <p>You can close this browser window and go back to your terminal.</p>
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
                    code as string,
                    serverConfig
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

                keychain.setKey('eclipse', 'auth', fileFormat);

                return res.end();
            } catch (err) {
                logger.error(`Error attempting to save access token: ${err}`);
            }
        };

    public async logout() {
        await this.keyChain.deleteKey('eclipse', 'auth');
        this.logger.message("You've been logged out successfully.");
    }
}
