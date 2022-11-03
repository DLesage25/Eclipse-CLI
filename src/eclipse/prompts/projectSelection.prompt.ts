import inquirer from 'inquirer';
import { Project } from '../types/Project.type';

const projectActions = [
    {
        name: '📋 Initialize a config file in this directory.',
        value: 'createConfig',
        short: 'Create config file',
    },
    {
        name: '🔑 Add a secret to this project.',
        value: 'add',
        short: 'Add secret',
    },
    {
        name: '🗑  Remove a secret from this project.',
        value: 'remove',
        short: 'Remove secret',
    },
    {
        name: '🔭 View secrets from this project.',
        value: 'view',
        short: 'View secrets',
    },
    {
        name: '🖊  Print project secrets to an .env file.',
        value: 'print',
        short: 'Print secrets to env file',
    },
    {
        name: '🙋 Show help log.',
        value: 'help',
        short: 'Show help log',
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
