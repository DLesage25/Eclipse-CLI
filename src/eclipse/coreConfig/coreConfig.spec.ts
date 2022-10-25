import 'reflect-metadata';
import { KeyChainMock } from '../../mocks/keychain.mock';
import { CoreConfig } from '../types/CoreConfig.type';

import CoreConfigModule from './coreConfig';

jest.mock('keytar');

const coreConfig: CoreConfig = {
    ECLIPSE_AUTH_SERVER_PORT: 4242,
    ECLIPSE_AUTH_CLIENT_ID: 'TEST2',
    ECLIPSE_AUTH_DOMAIN: 'TEST3',
    ECLIPSE_AUTH_CALLBACK_URL: 'http://localhost:4242',
    ECLIPSE_AUTH_TARGET_AUDIENCE: 'TEST5',
};

const fileNotationConfig =
    'ECLIPSE_AUTH_SERVER_PORT=4242\nECLIPSE_AUTH_CLIENT_ID=TEST2\nECLIPSE_AUTH_DOMAIN=TEST3\nECLIPSE_AUTH_CALLBACK_URL=http://localhost:4242\nECLIPSE_AUTH_TARGET_AUDIENCE=TEST5\n';

describe('CoreConfigModule', () => {
    const kcMock = new KeyChainMock();
    const coreconfig = new CoreConfigModule(kcMock);

    describe('get', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        it('should retrieve the core config and return it as an object', async () => {
            kcMock.getKey = jest.fn().mockReturnValueOnce(fileNotationConfig);
            const result = await coreconfig.get();

            expect(result).toEqual(coreConfig);
        });

        it('should return null if coreconfig not found', async () => {
            kcMock.getKey = jest.fn().mockReturnValueOnce(null);
            const result = await coreconfig.get();

            expect(result).toEqual(null);
        });
    });

    describe('set', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        it('should convert to file format and store on keychain', async () => {
            kcMock.setKey = jest.fn();
            await coreconfig.set(coreConfig);

            expect(kcMock.setKey).toHaveBeenCalledTimes(1);
            expect(kcMock.setKey).toHaveBeenCalledWith(
                'eclipse',
                'core',
                fileNotationConfig
            );
        });
    });

    describe('delete', () => {
        it('should delete coreconfig from keychain', async () => {
            kcMock.deleteKey = jest.fn();
            await coreconfig.delete();

            expect(kcMock.deleteKey).toHaveBeenCalledTimes(1);
            expect(kcMock.deleteKey).toHaveBeenCalledWith('eclipse', 'core');
        });
    });

    describe('initialize', () => {
        it('should set core config', async () => {
            kcMock.setKey = jest.fn();
            await coreconfig.initialize({
                ECLIPSE_AUTH_CLIENT_ID: 'TEST2',
                ECLIPSE_AUTH_DOMAIN: 'TEST3',
                ECLIPSE_AUTH_TARGET_AUDIENCE: 'TEST5',
            });

            expect(kcMock.setKey).toHaveBeenCalledTimes(1);
            expect(kcMock.setKey).toHaveBeenCalledWith(
                'eclipse',
                'core',
                fileNotationConfig
            );
        });
    });
});
