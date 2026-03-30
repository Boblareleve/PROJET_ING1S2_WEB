interface UserBase{
    nom: String,
    role:'admin'|'teacher'|'student'
}

interface Admin extends UserBase{
    role:'admin'
}

interface Student extends UserBase{
    role:'student'
    id: number
}

interface Teacher extends UserBase{
    role:'teacher'

}
export type User = Admin | Teacher | Student