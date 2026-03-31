

export interface Admins {};
export interface Supervisors {};
export interface Students {};

export interface Persons {
    first_name : string,
    last_name : string,
    info : Admins | Supervisors | Students,
};

export interface Companies {
    url : string,
};


export interface Account {
    id    : number,
    email : string,
    role  : number, // ROLE
    info  : Persons | Companies | null,
};

export enum ROLE {
    ADMIN: 0,
    SUPERVISOR: 1,
    STUDENT: 2,
    COMPANY: 3
}
