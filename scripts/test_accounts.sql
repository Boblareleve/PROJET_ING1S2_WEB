PRAGMA foreign_keys = OFF;

DELETE FROM Documents;
DELETE FROM Internship_files;
DELETE FROM Internship;
DELETE FROM Tokens;
DELETE FROM Persons;
DELETE FROM Students;
DELETE FROM Supervisors;
DELETE FROM Admins;
DELETE FROM Companies;
DELETE FROM Accounts;
DELETE FROM Document_types;
DELETE FROM Domains;

PRAGMA foreign_keys = ON;

-- password = "1234" (sha256)
INSERT INTO Accounts (email, password_hash) VALUES
    ('a@gmail.com',                '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
    ('c@gmail.com',                '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
    ('s@gmail.com',                '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
    ('e@gmail.com',                '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');

INSERT INTO Admins (id) SELECT id FROM Accounts WHERE email = 'a@gmail.com';
INSERT INTO Admins (id) SELECT id FROM Accounts WHERE email = 'augustin.denuce@gmail.com';
INSERT INTO Admins (id) SELECT id FROM Accounts WHERE email = 'quentin82.donier@gmail.com';

INSERT INTO Companies (id, name_company, url_site)
    SELECT id, 'TechCorp', 'https://techcorp.fr' FROM Accounts WHERE email = 'c@gmail.com';

INSERT INTO Supervisors (id) SELECT id FROM Accounts WHERE email = 's@gmail.com';

INSERT INTO Students (id) SELECT id FROM Accounts WHERE email = 'e@gmail.com';

INSERT INTO Persons (id, first_name, last_name)
    SELECT id, 'Admin', 'Test' FROM Accounts WHERE email = 'a@gmail.com';
INSERT INTO Persons (id, first_name, last_name)
    SELECT id, 'Augustin', 'Denuce' FROM Accounts WHERE email = 'augustin.denuce@gmail.com';
INSERT INTO Persons (id, first_name, last_name)
    SELECT id, 'Quentin', 'Donier' FROM Accounts WHERE email = 'quentin82.donier@gmail.com';
INSERT INTO Persons (id, first_name, last_name)
    SELECT id, 'Sophie', 'Marchand' FROM Accounts WHERE email = 's@gmail.com';
INSERT INTO Persons (id, first_name, last_name)
    SELECT id, 'Ethan', 'Duval' FROM Accounts WHERE email = 'e@gmail.com';

INSERT INTO Domains (title, abstract) VALUES
    ('Développement Web',  'Frontend, backend, fullstack'),
    ('Data / IA',          'Machine learning, data science, NLP'),
    ('Cybersécurité',      'Pentest, audit, SOC'),
    ('Systèmes embarqués', 'C, C++, RTOS, IoT'),
    ('Réseaux',            'Administration, infrastructure, cloud');

INSERT INTO Document_types (id, info) VALUES
    (1, 'Rapport'),
    (2, 'Résumé'),
    (3, 'Évaluation'),
    (4, 'Convention'),
    (5, 'Autre'),
    (6, 'Candidature');