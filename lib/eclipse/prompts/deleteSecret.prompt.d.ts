import inquirer from 'inquirer';
import { Secret } from '../types/Secret.type';
export default function deleteSecretPrompt(secrets: Secret[]): Promise<import("inquirer").Answers> & {
    ui: inquirer.ui.Prompt<import("inquirer").Answers>;
};
