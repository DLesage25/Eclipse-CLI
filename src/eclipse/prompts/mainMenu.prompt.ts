import inquirer from 'inquirer';

const menuActions = [
    {
        name: '🔐 See my projects',
        value: 'view',
        short: 'View projects',
    },
    {
        name: '🙋 Show help log.',
        value: 'help',
        short: 'Show help log',
    },
    {
        name: '💤 Log out',
        value: 'logout',
        short: 'Log out',
    },
    {
        name: '🚪 Exit',
        value: 'exit',
        short: 'Exit',
    },
];

export default function mainMenuPrompt() {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: menuActions,
        },
    ]);
}
