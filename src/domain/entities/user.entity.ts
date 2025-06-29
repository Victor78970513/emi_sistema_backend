export class UserEntity{
    constructor(
        public userId: string,
        public name: string,
        public lastName: string,
        public email: string,
        public password: string,
        public rol: string,
        public isActive: boolean,
    ){}
}