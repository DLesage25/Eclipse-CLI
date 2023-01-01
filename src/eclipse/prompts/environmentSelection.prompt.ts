import inquirer from 'inquirer';
import { Secret } from '../types/Secret.type';

export default function environmentSelectionPrompt(secrets: Secret[]) {
    const environmentChoices = secrets.map((s) => s.environment);

    return inquirer.prompt([
        {
            type: 'list',
            name: 'environment',
            message: 'Please select an environment.',
            choices: [...new Set(environmentChoices)],
        },
    ]);
}
