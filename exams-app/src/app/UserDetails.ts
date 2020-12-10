import { Authority } from './Authority';

export class UserDetails {
    username: string;
    password: string;
    authorities: Authority[];
    token: string;
    enabled: boolean;
    credentialsNonExpired: boolean;
    accountNonExpired:boolean;
    accountNonLocked: boolean;
}
