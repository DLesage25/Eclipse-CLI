import inquirer from 'inquirer';
import { Secret } from '../types/Secret.type';

export default function componentSelectionPrompt(secrets: Secret[]) {
    const componentChoices = [...new Set(secrets.map((s) => s.component))];

    return inquirer.prompt([
        {
            type: 'list',
            name: 'component',
            message: 'Please select a component.',
            choices: componentChoices,
        },
    ]);
}
