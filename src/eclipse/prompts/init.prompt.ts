import inquirer from 'inquirer';

export default function initPrompt() {
    return inquirer.prompt([
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
            type: 'input',
            name: 'ECLIPSE_API_URL',
            message: 'Please set your hosted API url:',
            default: 'http://localhost:8080/api',
        },
    ]);
}
