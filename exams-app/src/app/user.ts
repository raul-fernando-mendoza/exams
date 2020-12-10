import { Authority } from './Authority';

export class User {
    id: number;
    username: string;
    password: string;
    active:boolean;
    roles: string[];  
}
