import 'reflect-metadata';

import { CoreConfig } from 'eclipse/types/CoreConfig.type';
import { AuthMock } from '../../mocks/auth.mock';
import { CoreConfigMock } from '../../mocks/coreConfig.mock';
import { KeyChainMock } from '../../mocks/keychain.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import API from './api';
import { AuthConfig } from 'eclipse/types/AuthConfig.type';
import { Project } from 'eclipse/types/Project.type';
import { RevealedSecret, Secret } from 'eclipse/types/Secret.type';

const mockInterceptorsUse = jest.fn();
const mockPost = jest.fn();
const mockGet = jest.fn();
const mockDelete = jest.fn();

jest.mock('axios', () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: {
                use: () => mockInterceptorsUse(),
            },
        },
        post: (...arg: any) => mockPost(...arg),
        get: (...arg: any) => mockGet(...arg),
        delete: (...arg: any) => mockDelete(...arg),
    })),
}));

describe('API', () => {
    const authMock = new AuthMock();
    const kcMock = new KeyChainMock();
    const coreConfigMock = new CoreConfigMock(kcMock);
    const loggerMock = new LoggerMock();

    // @ts-ignore
    const api = new API(authMock, loggerMock, coreConfigMock);

    describe('Initialize', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });
        it('should return early if auth config is missing', async () => {
            jest.spyOn(authMock, 'getConfig').mockResolvedValueOnce(null);
            jest.spyOn(coreConfigMock, 'get').mockResolvedValueOnce(
                {} as CoreConfig
            );
            jest.spyOn(loggerMock, 'error');

            await api.Initialize();

            expect(authMock.getConfig).toHaveBeenCalled();
            expect(coreConfigMock.get).toHaveBeenCalled();
            expect(loggerMock.error).toHaveBeenCalled();
        });

        it('should return early if core config is missing', async () => {
            jest.spyOn(authMock, 'getConfig').mockResolvedValueOnce(
                {} as AuthConfig
            );
            jest.spyOn(coreConfigMock, 'get').mockResolvedValueOnce(null);
            jest.spyOn(loggerMock, 'error');

            await api.Initialize();

            expect(authMock.getConfig).toHaveBeenCalled();
            expect(coreConfigMock.get).toHaveBeenCalled();
            expect(loggerMock.error).toHaveBeenCalled();
        });

        it('should set up authorization header on axios instance if auth and core configs are found', async () => {
            jest.spyOn(authMock, 'getConfig').mockResolvedValueOnce({
                access_token: 'access_token',
            } as AuthConfig);
            jest.spyOn(coreConfigMock, 'get').mockResolvedValueOnce(
                {} as CoreConfig
            );
            jest.spyOn(loggerMock, 'error');

            await api.Initialize();

            expect(authMock.getConfig).toHaveBeenCalled();
            expect(coreConfigMock.get).toHaveBeenCalled();
            expect(mockInterceptorsUse).toHaveBeenCalled();
        });
    });

    describe('getCliValues', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should hit cli endpoint and return values', async () => {
            mockPost.mockResolvedValueOnce({
                data: {
                    ECLIPSE_AUTH_TARGET_AUDIENCE:
                        'ECLIPSE_AUTH_TARGET_AUDIENCE',
                    ECLIPSE_AUTH_CLIENT_ID: 'ECLIPSE_AUTH_CLIENT_ID',
                    ECLIPSE_AUTH_DOMAIN: 'ECLIPSE_AUTH_DOMAIN',
                },
            });
            const result = await api.getCliValues();

            expect(mockPost).toHaveBeenCalledWith('/cli');
            expect(result).toEqual({
                ECLIPSE_AUTH_TARGET_AUDIENCE: 'ECLIPSE_AUTH_TARGET_AUDIENCE',
                ECLIPSE_AUTH_CLIENT_ID: 'ECLIPSE_AUTH_CLIENT_ID',
                ECLIPSE_AUTH_DOMAIN: 'ECLIPSE_AUTH_DOMAIN',
            });
        });
    });

    describe('getUser', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should hit users endpoint and return values', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    payload: {
                        _id: 'id',
                        name: 'name',
                        email: 'email',
                        sub: 'sub',
                        createdAt: 'date',
                        projects: [],
                    },
                    timestamp: 1,
                    statusCode: 200,
                },
            });
            const result = await api.getUser();

            expect(mockGet).toHaveBeenCalledWith('/users');
            expect(result).toEqual({
                _id: 'id',
                name: 'name',
                email: 'email',
                sub: 'sub',
                createdAt: 'date',
                projects: [],
            });
        });
    });

    describe('getProjects', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should hit projects endpoint with no request options if not projectId is sent', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    timestamp: 1,
                    statusCode: 200,
                    payload: [
                        {
                            _id: '1',
                        },
                    ],
                },
            });
            const result = await api.getProjects();

            expect(mockGet).toHaveBeenCalledWith('/projects', undefined);
            expect(result).toEqual([{ _id: '1' }] as Project[]);
        });

        it('should hit projects endpoint and return parsed data if of type string', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    payload: '[{"_id": "1"}]',
                    statusCode: 200,
                    timestamp: 1,
                },
            });
            const result = await api.getProjects();

            expect(mockGet).toHaveBeenCalledWith('/projects', undefined);
            expect(result).toEqual([{ _id: '1' }] as Project[]);
        });

        it('should hit projects endpoint with no projectId parameter if sent to method', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    timestamp: 1,
                    statusCode: 200,
                    payload: [
                        {
                            _id: '1',
                        },
                    ],
                },
            });
            const result = await api.getProjects('projectId');

            expect(mockGet).toHaveBeenCalledWith('/projects', {
                params: {
                    projectId: 'projectId',
                },
            });
            expect(result).toEqual([{ _id: '1' }] as Project[]);
        });

        it('should error log and return empty array if get request fails', async () => {
            mockGet.mockRejectedValueOnce('error');
            jest.spyOn(loggerMock, 'error');
            const result = await api.getProjects('projectId');

            expect(mockGet).toHaveBeenCalledWith('/projects', {
                params: {
                    projectId: 'projectId',
                },
            });
            expect(loggerMock.error).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('getSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });

        it('should hit secrets endpoint with given project id and classifiers and return data', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    timestamp: 1,
                    statusCode: 200,
                    payload: [
                        {
                            _id: 'secret',
                        },
                    ],
                },
            });
            const result = await api.getSecrets('projectId', [
                'classifier1',
                'classifier2',
            ]);

            expect(mockGet).toHaveBeenCalledWith('/secrets/reveal', {
                data: {
                    project: {
                        _id: 'projectId',
                    },
                    classifiers: ['classifier1', 'classifier2'],
                },
            });
            expect(result).toEqual([{ _id: 'secret' }] as RevealedSecret[]);
        });
        it('should error log and return empty array if get request fails', async () => {
            mockGet.mockRejectedValueOnce('error');
            jest.spyOn(loggerMock, 'error');
            const result = await api.getSecrets('projectId', [
                'classifier1',
                'classifier2',
            ]);

            expect(mockGet).toHaveBeenCalledWith('/secrets/reveal', {
                data: {
                    project: {
                        _id: 'projectId',
                    },
                    classifiers: ['classifier1', 'classifier2'],
                },
            });
            expect(loggerMock.error).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('createSecret', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });

        const createSecretDto = {
            value: 'value',
            projectId: 'projectId',
            name: 'name',
            classifiers: ['classifier1', 'classifier2'],
        };

        it('should post to create secrets endpoint with dto', async () => {
            mockPost.mockResolvedValueOnce({
                data: {
                    timestamps: 1,
                    statusCode: 200,
                    payload: {
                        _id: 'secret',
                    },
                },
            });
            const result = await api.createSecret(createSecretDto);

            expect(mockPost).toHaveBeenCalledWith('/secrets', createSecretDto);
            expect(result).toEqual({ _id: 'secret' } as Secret);
        });
        it('should error log and return null if get request fails', async () => {
            mockPost.mockRejectedValueOnce('error');
            jest.spyOn(loggerMock, 'error');
            const result = await api.createSecret(createSecretDto);

            expect(mockPost).toHaveBeenCalledWith('/secrets', createSecretDto);
            expect(loggerMock.error).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('deleteSecret', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });

        it('should delete to secrets endpoint with given projectId and secret name', async () => {
            mockDelete.mockResolvedValueOnce(true);
            await api.deleteSecret('secretId', 'secretName');

            expect(mockDelete).toHaveBeenCalledWith('/secrets/secretId');
        });
        it('should error log and return null if get request fails', async () => {
            mockDelete.mockRejectedValueOnce(true);
            jest.spyOn(loggerMock, 'error');
            const result = await api.deleteSecret('secretId', 'secretName');

            expect(mockDelete).toHaveBeenCalledWith('/secrets/secretId');
            expect(loggerMock.error).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });
});
