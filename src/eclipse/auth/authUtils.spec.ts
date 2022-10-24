import { base64URLEncode, requestUserToken, sha256 } from './authUtils';

jest.mock('axios', () => async () => ({
    data: {
        access_token: 'accesstoken',
        expires_in: 1234,
    },
}));

describe('authUtils', () => {
    describe('requestUserToken', () => {
        const serverConfig = {
            ECLIPSE_AUTH_DOMAIN: 'ECLIPSE_AUTH_DOMAIN',
            ECLIPSE_AUTH_CLIENT_ID: 'ECLIPSE_AUTH_CLIENT_ID',
            ECLIPSE_AUTH_CALLBACK_URL: 'ECLIPSE_AUTH_CALLBACK_URL',
            ECLIPSE_AUTH_SERVER_PORT: 1234,
        };
        it('should POST to auth server and return auth config', async () => {
            jest.mock('axios');

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

describe('base64URLEncode', () => {
    it('should return a base64 encoded string from a buffer', () => {
        const buf = Buffer.from('thisisatest', 'utf-8');
        const result = base64URLEncode(buf);

        expect(result).toEqual('dGhpc2lzYXRlc3Q');
    });
    it('should replace + sign with -', () => {
        const buf = Buffer.from('thisisa+test', 'utf-8');
        const result = base64URLEncode(buf);

        expect(result).toEqual('dGhpc2lzYSt0ZXN0');
    });

    it('should replace \\ sign with -', () => {
        const buf = Buffer.from('thisisa\test', 'utf-8');
        const result = base64URLEncode(buf);

        expect(result).toEqual('dGhpc2lzYQllc3Q');
    });

    it('should replace = sign with -', () => {
        const buf = Buffer.from('thisisa=test', 'utf-8');
        const result = base64URLEncode(buf);

        expect(result).toEqual('dGhpc2lzYT10ZXN0');
    });
});

describe('sha256', () => {
    it('should return a buffer with an sha256 hash from a string', () => {
        const result = sha256('test');

        expect(result).toBeInstanceOf(Buffer);
    });
});
