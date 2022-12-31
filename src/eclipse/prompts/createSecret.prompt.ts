import inquirer from 'inquirer';

export default function createSecretPrompt() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Please set the name of this secret:',
        },
        {
            type: 'password',
            name: 'value',
            message: 'Please set the secret value',
        },
        {
            type: 'input',
            name: 'component',
            message: "Set this secret's component",
        },
        {
            type: 'input',
            name: 'environment',
            message: "Set this secret's environment",
        },
    ]);
}
