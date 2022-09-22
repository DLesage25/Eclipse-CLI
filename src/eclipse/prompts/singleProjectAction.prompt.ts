import inquirer from 'inquirer';

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

export default function singleProjectActionPrompt(projectName: string) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: `Looks like you are in the project ${projectName} directory. What would you like to do?`,
            choices: projectActions,
        },
    ]);
}
