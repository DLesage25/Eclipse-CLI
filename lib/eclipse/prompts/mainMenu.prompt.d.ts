import inquirer from 'inquirer';
export default function mainMenuPrompt(): Promise<import("inquirer").Answers> & {
    ui: inquirer.ui.Prompt<import("inquirer").Answers>;
};
