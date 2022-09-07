import inquirer from 'inquirer';
import { Secret } from '../types/Secret.type';

export default function deleteSecretPrompt(secrets: Secret[]) {
    const secretChoices = secrets.map((s) => ({
        name: s.name,
        value: s._id,
        short: s.name,
    }));

    return inquirer.prompt([
        {
            type: 'list',
            name: 'secretId',
            message: 'Please select the secret you would like to remove:',
            choices: secretChoices,
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'This action cannot be undone. Please confirm deletion:',
        },
    ]);
}
