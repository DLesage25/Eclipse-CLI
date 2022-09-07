import inquirer from 'inquirer';
import { Project } from '../types/Project.type';

const projectActions = [
    {
        name: 'View secrets from this project.',
        value: 'view',
        short: 'View secrets',
    },
    {
        name: 'Add a secret to this project.',
        value: 'add',
        short: 'Add secret',
    },
    {
        name: 'Remove a secret from this project.',
        value: 'remove',
        short: 'Remove secret',
    },
    {
        name: 'Print project secrets to an .env file.',
        value: 'print',
        short: 'Print secrets to env file',
    },
];

export default function projectSelectionPrompt(projects: Project[]) {
    const projectChoices = projects.map((p) => ({
        name: `${p.name} - ${p.createdAt}`,
        value: p._id,
        short: p.name,
    }));

    return inquirer.prompt([
        {
            type: 'list',
            name: 'projectId',
            message: 'Please select a project.',
            choices: projectChoices,
        },
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: projectActions,
        },
    ]);
}
