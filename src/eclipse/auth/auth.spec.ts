import 'reflect-metadata';
import { CoreConfigMock } from '../../mocks/coreConfig.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import { KeyChainMock } from '../../mocks/keychain.mock';
import { Auth, requestUserToken } from './auth';
import { AuthConfig } from '../types/AuthConfig.type';
import axios from 'axios';
const authConfig: AuthConfig = {
    access_token: 'accesstoken',
    expiration_date: 1234,
};

const fileNotationAuthConfig =
    'access_token=accesstoken\nexpiration_date=1234\n';

jest.mock('axios', () => async () => ({
    data: {
        access_token: 'accesstoken',
        expires_in: 1234,
    },
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
            const createAuthServerSpy = jest.spyOn(
                Auth.prototype as any,
                'createAuthServer'
            );
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

    describe('logout', () => {
        it('should delete core config', async () => {
            jest.spyOn(kcMock, 'deleteKey');

            await auth.logout();
            expect(kcMock.deleteKey).toHaveBeenCalledWith('eclipse', 'auth');
        });
    });

    describe('requestUserToken', () => {
        const serverConfig = {
            ECLIPSE_AUTH_DOMAIN: 'ECLIPSE_AUTH_DOMAIN',
            ECLIPSE_AUTH_CLIENT_ID: 'ECLIPSE_AUTH_CLIENT_ID',
            ECLIPSE_AUTH_CALLBACK_URL: 'ECLIPSE_AUTH_CALLBACK_URL',
            ECLIPSE_AUTH_SERVER_PORT: 1234,
        };
        it('should POST to auth server and return auth config', async () => {
            const result = await requestUserToken(
                'codeverifier',
                'code',
                serverConfig
            );

            expect(result).toEqual({
                access_token: 'accesstoken',
                expires_in: 1234,
            });
        });
    });
});
