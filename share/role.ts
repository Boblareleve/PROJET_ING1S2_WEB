

export interface Admin      {};
export interface Supervisor {};
export interface Student    {};

export interface Person {
    first_name : string,
    last_name : string,
    info : Admin | Supervisor | Student,
};

export interface Companie {
    url : string,
};


export interface Account {
    id    : number,
    email : string,
    password_hash : string | null,
    role  : number, // ROLE
    info  : Person | Companie | null,
};


export const ROLE = Object.freeze({
    ADMIN: 0,
    SUPERVISOR: 1,
    STUDENT: 2,
    COMPANY: 3
});
