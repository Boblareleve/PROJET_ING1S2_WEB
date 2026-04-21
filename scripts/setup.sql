
CREATE TABLE Accounts
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE Tokens
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL,
    expiration      INTEGER NOT NULL,
    token           TEXT UNIQUE NOT NULL,
    
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);

CREATE TABLE Persons
(
    id         INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,

    FOREIGN KEY (id) REFERENCES Accounts(id)
);


CREATE TABLE Admins
(
    id INTEGER PRIMARY KEY,
    
    FOREIGN KEY (id) REFERENCES Accounts(id)
);

CREATE TABLE Supervisors
(
    id INTEGER PRIMARY KEY,
    
    FOREIGN KEY (id) REFERENCES Accounts(id)
);

CREATE TABLE Students
(
    id INTEGER PRIMARY KEY,
    
    FOREIGN KEY (id) REFERENCES Accounts(id)
);

CREATE TABLE Companies
(
    id INTEGER PRIMARY KEY,
    
    name_company TEXT NOT NULL UNIQUE,
    url_site TEXT,

    FOREIGN KEY (id) REFERENCES Accounts(id)
);

CREATE TABLE Report_card
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,

    file_path TEXT,

    FOREIGN KEY (student_id) REFERENCES Students(id)
);

CREATE TABLE Internship
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id  INTEGER NOT NULL,
    domain_id   INTEGER,

    title       TEXT NOT NULL UNIQUE,
    abstract    TEXT,

    min_begin   INTEGER,
    max_begin   INTEGER,
    
    duration    INTEGER, -- mounth length
    
    FOREIGN KEY (company_id) REFERENCES Companies(id)
    FOREIGN KEY (domain_id)  REFERENCES Domains(id)
);

CREATE TABLE Internship_files
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id      INTEGER NOT NULL,
    internship_id   INTEGER NOT NULL,
    tutor_id        INTEGER,
    
    FOREIGN KEY (student_id)    REFERENCES Students(id),
    FOREIGN KEY (internship_id) REFERENCES Internship(id),
    FOREIGN KEY (tutor_id)      REFERENCES Supervisors(id)
);

CREATE TABLE Documents
(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_file_id  INTEGER NOT NULL,
    
    file_path   TEXT,
    type_id     INTEGER NOT NULL,
    
    student_accessible BOOLEAN,
    tutor_accessible BOOLEAN,
    company_accessible BOOLEAN,
    
    FOREIGN KEY (type_id)            REFERENCES Document_types(id),
    FOREIGN KEY (internship_file_id) REFERENCES Internship_files(id)
);

CREATE TABLE Document_types
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    info TEXT
);

CREATE TABLE Domains
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title       TEXT NOT NULL UNIQUE,
    abstract    TEXT
);

