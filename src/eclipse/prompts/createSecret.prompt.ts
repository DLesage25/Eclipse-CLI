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
            name: 'rawClassifiers',
            message:
                'Classifiers let you order secrets based on categories. Please separate classifiers with a comma (e.g. web,production)',
        },
    ]);
}
