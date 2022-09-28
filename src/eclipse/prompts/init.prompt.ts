import inquirer from 'inquirer';

export default function initPrompt() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'ECLIPSE_AUTH_SERVER_PORT',
            message: 'Please set the port of your auth server:',
        },
        {
            type: 'password',
            name: 'ECLIPSE_AUTH_CLIENT_ID',
            message: 'Please set your Auth0 CLI client ID:',
        },
        {
            type: 'password',
            name: 'ECLIPSE_AUTH_DOMAIN',
            message: 'Please set your Auth0 domain:',
        },
        {
            type: 'password',
            name: 'ECLIPSE_AUTH_TARGET_AUDIENCE',
            message: 'Please set your Auth0 target audience:',
        },
        {
            type: 'input',
            name: 'ECLIPSE_AUTH_CALLBACK_URL',
            message: 'Please set your auth callback url:',
        },
        {
            type: 'input',
            name: 'ECLIPSE_API_URL',
            message: 'Please set your hosted API url:',
        },
    ]);
}
