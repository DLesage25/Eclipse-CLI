export interface ServerConfig {
    ECLIPSE_AUTH_DOMAIN: string;
    ECLIPSE_AUTH_CLIENT_ID: string;
    ECLIPSE_AUTH_CALLBACK_URL: string;
    ECLIPSE_AUTH_SERVER_PORT: number;
}

export interface AuthUrlConfig {
    ECLIPSE_AUTH_TARGET_AUDIENCE: string;
    ECLIPSE_AUTH_CLIENT_ID: string;
    ECLIPSE_AUTH_CALLBACK_URL: string;
    ECLIPSE_AUTH_DOMAIN: string;
}
