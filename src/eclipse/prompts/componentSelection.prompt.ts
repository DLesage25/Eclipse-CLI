import inquirer from 'inquirer';
import { Secret } from '../types/Secret.type';

// TODO - not currently being utilized in absence of project-level components
export default function componentSelectionPrompt(
    secrets: Secret[],
    other?: boolean
) {
    const componentChoices = secrets.length
        ? [...new Set(secrets.map((s) => s.component))]
        : [];

    if (other) componentChoices.push('Other');

    return inquirer.prompt([
        {
            type: 'list',
            name: 'component',
            message: 'Please select a component.',
            choices: componentChoices,
        },
    ]);
}
