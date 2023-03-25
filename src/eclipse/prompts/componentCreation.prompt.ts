import inquirer from 'inquirer';

export default function componentCreationPrompt() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'component',
            message: 'Please set the name of the component:',
        },
    ]);
}
