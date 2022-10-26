import 'reflect-metadata';
import http from 'http';
import url, { Url } from 'url';

import { CoreConfigMock } from '../../mocks/coreConfig.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import { KeyChainMock } from '../../mocks/keychain.mock';
import Auth from './auth';
import { AuthConfig } from '../types/AuthConfig.type';

const authConfig: AuthConfig = {
    access_token: 'accesstoken',
    expiration_date: 1234,
};

const fileNotationAuthConfig =
    'access_token=accesstoken\nexpiration_date=1234\n';

const mockOpen = jest.fn();
jest.mock('open', () => () => mockOpen());

const mockRequestUserToken = jest.fn();
jest.mock('./authUtils', () => ({
    requestUserToken: () => mockRequestUserToken(),
    base64URLEncode: jest.fn(),
    sha256: jest.fn(),
}));

describe('Auth', () => {
    const kcMock = new KeyChainMock();
    const coreConfigMock = new CoreConfigMock(kcMock);
    const loggerMock = new LoggerMock();
    // @ts-ignore
    const auth = new Auth(kcMock, loggerMock, coreConfigMock);

    describe('checkIfAuthFlowRequired', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });
        it('should initialize auth flow if now auth config found', async () => {
            jest.spyOn(kcMock, 'getKey').mockResolvedValueOnce(null);
            jest.spyOn(auth, 'initializeAuthFlow');

            await auth.checkIfAuthFlowRequired();

            expect(kcMock.getKey).toHaveBeenCalledWith('eclipse', 'auth');
            expect(auth.initializeAuthFlow).toHaveBeenCalled();
        });

        it('should initialize auth if token expired', async () => {
            jest.spyOn(kcMock, 'getKey').mockResolvedValueOnce('test=test');
            const checkIfTokenExpiredSpy = jest
                .spyOn(Auth.prototype as any, 'checkIfTokenExpired')
                .mockResolvedValueOnce(true);
            jest.spyOn(auth, 'initializeAuthFlow');

            await auth.checkIfAuthFlowRequired();

            expect(kcMock.getKey).toHaveBeenCalledWith('eclipse', 'auth');
            expect(checkIfTokenExpiredSpy).toHaveBeenCalled();
            expect(auth.initializeAuthFlow).toHaveBeenCalled();
        });

        it('should return false if auth config exists and token did not expire', async () => {
            jest.spyOn(kcMock, 'getKey').mockResolvedValueOnce('test=test');
            const checkIfTokenExpiredSpy = jest
                .spyOn(Auth.prototype as any, 'checkIfTokenExpired')
                .mockResolvedValueOnce(false);
            jest.spyOn(auth, 'initializeAuthFlow');

            const result = await auth.checkIfAuthFlowRequired();

            expect(kcMock.getKey).toHaveBeenCalledWith('eclipse', 'auth');
            expect(checkIfTokenExpiredSpy).toHaveBeenCalled();
            expect(auth.initializeAuthFlow).not.toHaveBeenCalled();
            expect(result).toBeFalsy();
        });
    });

    describe('initializeAuthFlow', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });
        it('should return false if core config is not found', async () => {
            jest.spyOn(kcMock, 'getKey').mockResolvedValueOnce(null);
            const createCodeChallengeSpy = jest.spyOn(
                Auth.prototype as any,
                'createCodeChallenge'
            );

            const result = await auth.initializeAuthFlow();

            expect(createCodeChallengeSpy).toHaveBeenCalled();
            expect(result).toBeFalsy();
        });
        it('should create and auth server, open and auth page, and return true if core config is found', async () => {
            jest.spyOn(coreConfigMock, 'get').mockResolvedValueOnce({
                ECLIPSE_AUTH_DOMAIN: 'test',
                ECLIPSE_AUTH_CLIENT_ID: 'test',
                ECLIPSE_AUTH_CALLBACK_URL: 'test',
                ECLIPSE_AUTH_SERVER_PORT: 123,
                ECLIPSE_AUTH_TARGET_AUDIENCE: 'test',
            });
            const createCodeChallengeSpy = jest
                .spyOn(Auth.prototype as any, 'createCodeChallenge')
                .mockReturnValueOnce('codechallenge');
            const createAuthServerSpy = jest
                .spyOn(Auth.prototype as any, 'createAuthServer')
                .mockImplementation(() => jest.fn());
            const constructAuthUrlSpy = jest.spyOn(
                Auth.prototype as any,
                'constructAuthUrl'
            );
            const openAuthPageSpy = jest
                .spyOn(Auth.prototype as any, 'openAuthPage')
                .mockResolvedValueOnce(null);

            const result = await auth.initializeAuthFlow();

            expect(createCodeChallengeSpy).toHaveBeenCalled();
            expect(coreConfigMock.get).toHaveBeenCalled();
            expect(createAuthServerSpy).toHaveBeenCalledWith({
                ECLIPSE_AUTH_DOMAIN: 'test',
                ECLIPSE_AUTH_CLIENT_ID: 'test',
                ECLIPSE_AUTH_CALLBACK_URL: 'test',
                ECLIPSE_AUTH_SERVER_PORT: 123,
            });
            expect(constructAuthUrlSpy).toHaveBeenCalledWith(
                'codechallenge',
                'abc123',
                {
                    ECLIPSE_AUTH_DOMAIN: 'test',
                    ECLIPSE_AUTH_CLIENT_ID: 'test',
                    ECLIPSE_AUTH_CALLBACK_URL: 'test',
                    ECLIPSE_AUTH_TARGET_AUDIENCE: 'test',
                }
            );
            expect(openAuthPageSpy).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });
    });

    describe('getConfig', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return null if auth config not found', async () => {
            jest.spyOn(kcMock, 'getKey').mockResolvedValueOnce(null);
            const result = await auth.getConfig();

            expect(kcMock.getKey).toHaveBeenCalledWith('eclipse', 'auth');
            expect(result).toBeNull();
        });

        it('should return auth config in object notation if found', async () => {
            jest.spyOn(kcMock, 'getKey').mockResolvedValueOnce(
                fileNotationAuthConfig
            );
            const result = await auth.getConfig();

            expect(kcMock.getKey).toHaveBeenCalledWith('eclipse', 'auth');
            expect(result).toEqual(authConfig);
        });
    });

    describe('openAuthPage', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should open a browser page for authentication', async () => {
            await auth['openAuthPage']('url');

            expect(mockOpen).toHaveBeenCalled();
        });

        it('should log exceptions raised when opening browser page', async () => {
            mockOpen.mockImplementationOnce(() => {
                throw new Error('error');
            });
            jest.spyOn(loggerMock, 'error');

            await auth['openAuthPage']('url');

            expect(mockOpen).toHaveBeenCalled();
            expect(loggerMock.error).toHaveBeenCalled();
        });
    });

    describe('handleAuthResponse', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        const codeVerifier = 'codeverifier';
        const kc = new KeyChainMock();
        const serverConfig = {
            ECLIPSE_AUTH_DOMAIN: 'test',
            ECLIPSE_AUTH_CLIENT_ID: 'test',
            ECLIPSE_AUTH_CALLBACK_URL: 'test',
            ECLIPSE_AUTH_SERVER_PORT: 123,
        };

        it('should return early if no url is included on the request', async () => {
            const req = {} as http.IncomingMessage;
            const res = {} as http.ServerResponse;
            await auth['handleAuthResponse'](
                codeVerifier,
                kc,
                loggerMock,
                serverConfig
            )(req, res);
            jest.spyOn(url, 'parse');

            expect(url.parse).not.toHaveBeenCalled();
        });

        it('should return early if no code and state are included on the parsed url', async () => {
            const req = {
                url: 'test',
            } as http.IncomingMessage;

            const resWrite = jest.fn();
            const res = {
                write: resWrite,
            } as unknown as http.ServerResponse;

            const urlQuery = {
                query: {
                    error: 'error',
                    error_description: 'desc',
                },
            };

            jest.spyOn(url, 'parse').mockReturnValueOnce(
                urlQuery as unknown as Url
            );

            await auth['handleAuthResponse'](
                codeVerifier,
                kc,
                loggerMock,
                serverConfig
            )(req, res);

            expect(url.parse).toHaveBeenCalled();
            expect(resWrite).toHaveBeenCalledWith(`
            <html>
            <body>
                <h1>LOGIN FAILED</h1>
                <div>${'error'}</div>
                <div>${'desc'}
            </body>
            </html>
            `);
        });

        it('should render success page and store auth config to keychain if code and state on url', async () => {
            const req = {
                url: 'test',
            } as http.IncomingMessage;

            const resWrite = jest.fn();
            const res = {
                write: resWrite,
            } as unknown as http.ServerResponse;

            const urlQuery = {
                query: {
                    code: 'code',
                    state: 'state',
                },
            };

            jest.spyOn(url, 'parse').mockReturnValueOnce(
                urlQuery as unknown as Url
            );
            jest.spyOn(kc, 'setKey');

            mockRequestUserToken.mockResolvedValueOnce({
                access_token: 'token',
                expires_in: 1,
            });

            await auth['handleAuthResponse'](
                codeVerifier,
                kc,
                loggerMock,
                serverConfig
            )(req, res);
            const expiration_date = (Date.now() + 1 * 1000).toString();

            expect(url.parse).toHaveBeenCalled();
            expect(resWrite).toHaveBeenCalledWith(`
            <html>
            <body>
                <h1>LOGIN SUCCEEDED</h1>
                <p>You can close this browser window and go back to your terminal.</p>
            </body>
            </html>
            `);
            expect(mockRequestUserToken).toHaveBeenCalled();
            expect(kc.setKey).toHaveBeenCalledWith(
                'eclipse',
                'auth',
                `access_token=token\nexpiration_date=${expiration_date}\n`
            );
        });
    });

    describe('logout', () => {
        it('should delete core config', async () => {
            jest.spyOn(kcMock, 'deleteKey');

            await auth.logout();
            expect(kcMock.deleteKey).toHaveBeenCalledWith('eclipse', 'auth');
        });
    });
});
