export interface CoreConfig {
    ECLIPSE_AUTH_SERVER_PORT: number;
    ECLIPSE_AUTH_CLIENT_ID: string;
    ECLIPSE_AUTH_DOMAIN: string;
    ECLIPSE_AUTH_CALLBACK_URL: string;
    ECLIPSE_AUTH_TARGET_AUDIENCE: string;
    FIRST_RUN: boolean;
}

export interface ApiConfig {
    ECLIPSE_AUTH_TARGET_AUDIENCE: string;
    ECLIPSE_AUTH_CLIENT_ID: string;
    ECLIPSE_AUTH_DOMAIN: string;
}
