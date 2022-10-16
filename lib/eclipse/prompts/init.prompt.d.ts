import inquirer from 'inquirer';
export default function initPrompt(): Promise<import("inquirer").Answers> & {
    ui: inquirer.ui.Prompt<import("inquirer").Answers>;
};
