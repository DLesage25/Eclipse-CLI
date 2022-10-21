import inquirer from 'inquirer';

export default function confirmPrompt(confirmText: string) {
    return inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: confirmText,
        },
    ]);
}
