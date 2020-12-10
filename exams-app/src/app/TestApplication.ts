import { Test } from './test';
import { User } from './user';

export class TestApplication {
    id:number;
	test:Test;
    teacher:User;
    student:User;
    grade:number;
    completed:boolean;
}