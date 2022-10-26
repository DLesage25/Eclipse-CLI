import axios from 'axios';
import * as crypto from 'crypto';
import { ServerConfig } from './auth.types';

export function base64URLEncode(str: Buffer): string {
    return str
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function sha256(buffer: string) {
    return crypto.createHash('sha256').update(buffer).digest();
}

export function requestUserToken(
    codeVerifier: string,
    code: string,
    serverConfig: ServerConfig
) {
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
}
