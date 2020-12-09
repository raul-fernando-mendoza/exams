import { Authority } from './Authority';

export class User {
    username: string;
    password: string;
    authorities: Authority[];
    token: string;
    enabled: boolean;
    credentialsNonExpired: boolean;
    accountNonExpired:boolean;
    accountNonLocked: boolean;
}
