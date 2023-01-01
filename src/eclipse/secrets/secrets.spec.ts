import 'reflect-metadata';

import { Project } from 'eclipse/types/Project.type';
import { ApiMock } from '../../mocks/api.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import Secrets from './secrets';
import { RevealedSecret } from 'eclipse/types/Secret.type';

const mockCreateSecretPrompt = jest.fn();
jest.mock(
    '../prompts/createSecret.prompt',
    () => () => mockCreateSecretPrompt()
);

const mockDeleteSecretPrompt = jest.fn();
jest.mock(
    '../prompts/deleteSecret.prompt',
    () => () => mockDeleteSecretPrompt()
);

describe('secrets', () => {
    const apiMock = new ApiMock();
    const loggerMock = new LoggerMock();
    // @ts-ignore
    const secrets = new Secrets(apiMock, loggerMock);

    describe('addSecretFromMenu', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('it should prompt the user for secret creation values and create secret', async () => {
            jest.spyOn(secrets, 'addSecret').mockImplementationOnce(
                async () => {
                    return;
                }
            );
            mockCreateSecretPrompt.mockResolvedValueOnce({
                name: 'name',
                value: 'value',
                component: 'component',
                environment: 'environment',
            });

            await secrets.addSecretFromMenu({ _id: '123' } as Project);

            expect(mockCreateSecretPrompt).toHaveBeenCalled();
            expect(secrets.addSecret).toHaveBeenCalledWith(
                { _id: '123' } as Project,
                'name',
                'value',
                'component',
                'environment'
            );
        });
    });

    describe('removeSecretFromMenu', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should abort if user does not confirm', async () => {
            jest.spyOn(secrets, 'removeSecret').mockImplementationOnce(
                async () => {
                    return;
                }
            );
            mockDeleteSecretPrompt.mockResolvedValueOnce({
                secret: '',
                confirm: false,
            });

            await secrets.removeSecretFromMenu({ _id: '123' } as Project);

            expect(mockDeleteSecretPrompt).toHaveBeenCalled();
            expect(secrets.removeSecret).not.toHaveBeenCalled();
        });

        it('should remove secret if user confirms', async () => {
            jest.spyOn(secrets, 'removeSecret').mockImplementationOnce(
                async () => {
                    return;
                }
            );
            mockDeleteSecretPrompt.mockResolvedValueOnce({
                secret: { _id: 'id', name: 'name' },
                confirm: true,
            });

            await secrets.removeSecretFromMenu({ _id: '123' } as Project);

            expect(mockDeleteSecretPrompt).toHaveBeenCalled();
            expect(secrets.removeSecret).toHaveBeenCalledWith({
                secretId: 'id',
                secretName: 'name',
            });
        });
    });

    describe('addSecret', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should create a secret via API', async () => {
            jest.spyOn(apiMock, 'createSecret').mockImplementationOnce(
                async () => ({
                    name: 'secret',
                })
            );

            await secrets.addSecret(
                { _id: '123', ownerId: 'ownerId' } as Project,
                'secret',
                'value',
                'component',
                'environment'
            );

            expect(apiMock.createSecret).toHaveBeenCalledWith({
                projectId: '123',
                name: 'secret',
                value: 'value',
                component: 'component',
                environment: 'environment',
                ownerId: 'ownerId',
            });
        });
    });

    describe('getPartialSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if no secrets are found', async () => {
            jest.spyOn(apiMock, 'getSecrets').mockImplementationOnce(
                async () => []
            );

            const result = await secrets.getPartialSecrets(
                { _id: '123', ownerId: 'ownerId' } as Project,
                'component',
                'environment'
            );

            expect(apiMock.getSecrets).toHaveBeenCalledWith({
                projectId: '123',
                ownerId: 'ownerId',
                component: 'component',
                environment: 'environment',
            });

            expect(result).toBeUndefined();
        });

        it('should return object with secret names as keys and values if secrets found', async () => {
            jest.spyOn(apiMock, 'getSecrets').mockImplementationOnce(
                async () =>
                    [
                        { _id: '123', name: 'test1', value: 'value1' },
                        { _id: '234', name: 'test2', value: 'value2' },
                    ] as RevealedSecret[]
            );

            const result = await secrets.getPartialSecrets(
                { _id: '123', ownerId: 'ownerId' } as Project,
                'component',
                'environment'
            );

            expect(apiMock.getSecrets).toHaveBeenCalledWith({
                projectId: '123',
                component: 'component',
                environment: 'environment',
                ownerId: 'ownerId',
            });

            expect(result).toEqual({
                test1: 'value1',
                test2: 'value2',
            });
        });
    });

    describe('getFullSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if no secrets are found', async () => {
            jest.spyOn(apiMock, 'getSecrets').mockImplementationOnce(
                async () => []
            );

            const result = await secrets.getFullSecrets(
                { _id: '123', ownerId: 'ownerId' } as Project,
                'component',
                'environment'
            );

            expect(apiMock.getSecrets).toHaveBeenCalledWith({
                projectId: '123',
                ownerId: 'ownerId',
                component: 'component',
                environment: 'environment',
            });

            expect(result).toBeUndefined();
        });

        it('should return object with secret names as keys and full secret object as value if includeAllProperties is true', async () => {
            jest.spyOn(apiMock, 'getSecrets').mockImplementationOnce(
                async () =>
                    [
                        { _id: '123', name: 'test1', value: 'value1' },
                        { _id: '234', name: 'test2', value: 'value2' },
                    ] as RevealedSecret[]
            );

            const result = await secrets.getFullSecrets(
                { _id: '123', ownerId: 'ownerId' } as Project,
                'component',
                'environment'
            );

            expect(apiMock.getSecrets).toHaveBeenCalledWith({
                projectId: '123',
                ownerId: 'ownerId',
                component: 'component',
                environment: 'environment',
            });

            expect(result).toEqual({
                test1: {
                    _id: '123',
                    name: 'test1',
                    value: 'value1',
                } as RevealedSecret,
                test2: {
                    _id: '234',
                    name: 'test2',
                    value: 'value2',
                } as RevealedSecret,
            });
        });
    });

    describe('removeSecret', () => {
        it('should remove a secret via the CLI', async () => {
            jest.spyOn(apiMock, 'deleteSecret').mockImplementationOnce(
                async () => {
                    return;
                }
            );

            await secrets.removeSecret({
                secretId: '123',
                secretName: 'name',
            });

            expect(apiMock.deleteSecret).toHaveBeenCalledWith({
                secretId: '123',
                secretName: 'name',
            });
        });
    });
});
