
CREATE TABLE IF NOT EXISTS Accounts
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT,
    hash_password TEXT
);

CREATE TABLE IF NOT EXISTS Persons
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER  NOT NULL,               
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,

    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);


CREATE TABLE IF NOT EXISTS Admins
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    
    FOREIGN KEY (person_id) REFERENCES Persons(id)
);

CREATE TABLE IF NOT EXISTS Tutors
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    
    FOREIGN KEY (person_id) REFERENCES Persons(id)
);

CREATE TABLE IF NOT EXISTS Jury_membres
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    
    FOREIGN KEY (person_id) REFERENCES Persons(id)
);

CREATE TABLE IF NOT EXISTS Students
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    
    FOREIGN KEY (person_id) REFERENCES Persons(id)

);

CREATE TABLE IF NOT EXISTS Company
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    
    url_site TEXT,

    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);

CREATE TABLE IF NOT EXISTS Offers
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES Company(id)
);

CREATE TABLE IF NOT EXISTS Report_card
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,

    file_path TEXT,

    FOREIGN KEY (student_id) REFERENCES Students(id)
);

CREATE TABLE IF NOT EXISTS Internship
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES Company(id)
);

CREATE TABLE IF NOT EXISTS Internship_files
(
    id INTEGER PRIMARY KEY,
    student_id      INTEGER NOT NULL,
    internship_id   INTEGER NOT NULL,
    
    FOREIGN KEY (student_id)    REFERENCES Students(id),
    FOREIGN KEY (internship_id) REFERENCES Internship(id)
);

CREATE TABLE IF NOT EXISTS Notes_tutors
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_file_id INTEGER NOT NULL,
    
    info TEXT,
    create_date INTEGER,
    
    FOREIGN KEY (internship_file_id) REFERENCES Internship_files(id)
);

CREATE TABLE IF NOT EXISTS Notes_students
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_file_id INTEGER NOT NULL,
    
    info TEXT,
    create_date INTEGER,
    
    FOREIGN KEY (internship_file_id) REFERENCES Internship_files(id)
);


CREATE TABLE IF NOT EXISTS Documents
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_file_id INTEGER NOT NULL,
    
    file_path   TEXT,
    type_id     INTEGER NOT NULL,
    
    FOREIGN KEY (type_id) REFERENCES Document_types(id),
    FOREIGN KEY (internship_file_id) REFERENCES Internship_files(id)
);


CREATE TABLE IF NOT EXISTS Document_types
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    info TEXT
);

CREATE TABLE IF NOT EXISTS Domaines
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL
);

