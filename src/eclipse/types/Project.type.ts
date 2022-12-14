import { Secret } from './Secret.type';

export interface Project {
    _id: string;
    name: string;
    createdAt: string;
    ownerId: string;
    secrets: Secret[];
}
