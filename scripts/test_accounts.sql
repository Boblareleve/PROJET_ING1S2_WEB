DELETE FROM Accounts;
DELETE FROM Admins;
DELETE FROM Companies;


INSERT INTO Accounts (email, password_hash)
VALUES
    ("augustin.denuce@gmail.com",  "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("quentin82.donier@gmail.com", "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("a@gmail.com",                "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("c@gmail.com",                "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("s@gmail.com",                "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("e@gmail.com",                "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4");


INSERT INTO Companies (id, name_company)
    SELECT id, "a_company" 
    FROM Accounts 
    WHERE "c@gmail.com" = email;

INSERT INTO Admins (id)
    SELECT id FROM Accounts WHERE "a@gmail.com" = email;



INSERT INTO Supervisors (id)
    SELECT id FROM Accounts WHERE "s@gmail.com" = email;

INSERT INTO Persons (id, first_name, last_name)
    SELECT id, "First_name_sup", "Last_name_sup"
    FROM Accounts 
    WHERE "s@gmail.com" = email;



INSERT INTO Students (id)
    SELECT id FROM Accounts WHERE "e@gmail.com" = email;

INSERT INTO Persons (id, first_name, last_name)
    SELECT id, "First_name_stu", "Last_name_stu"
    FROM Accounts 
    WHERE "e@gmail.com" = email;



INSERT INTO Admins (id)
    SELECT id FROM Accounts WHERE "augustin.denuce@gmail.com" = email;


INSERT INTO Admins (id)
    SELECT id FROM Accounts WHERE "quentin82.donier@gmail.com" = email;

INSERT INTO Document_types (id, info) VALUES (1, 'rapport');
INSERT INTO Document_types (id, info) VALUES (2, 'resume');
INSERT INTO Document_types (id, info) VALUES (3, 'evaluation');
INSERT INTO Document_types (id, info) VALUES (4, 'convention');
INSERT INTO Document_types (id, info) VALUES (5, 'autre');