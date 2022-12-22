export interface Secret {
    _id: string;
    name: string;
    createdAt: Date;
    lastUpdate?: string;
    component: string;
    environment: string;
    projectId: string;
}

export interface RevealedSecret {
    _id: string;
    name: string;
    value: string;
    component: string;
    environment: string;
    last_updated: string;
    created_at: string;
}
