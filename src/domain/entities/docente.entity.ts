export class DocenteEntity{
    constructor(
        public id: string,
        public name: string,
        public lastname: string,
        public email: string,
        // public imageProfile?:string,
        public ci: number,
        public gender: string,
        public academicGrade: string,
        public profesionalTitle: string,
        public yearOfGraduation: number,
        public university:string,
        
    ){}
}