import inquirer from 'inquirer';
export default function createSecretPrompt(): Promise<import("inquirer").Answers> & {
    ui: inquirer.ui.Prompt<import("inquirer").Answers>;
};
