DELETE FROM Accounts;
DELETE FROM Admins;
DELETE FROM Companies;


INSERT INTO Accounts (email, password_hash)
VALUES
    ("augustin.denuce@gmail.com",  "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("a@gmail.com",                "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("c@gmail.com",                "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"),
    ("quentin82.donier@gmail.com", "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4");


INSERT INTO Companies (id)
    SELECT id FROM Accounts WHERE "c@gmail.com" = email;
INSERT INTO Admins (id)
    SELECT id FROM Accounts WHERE "a@gmail.com" = email;

INSERT INTO Admins (id)
    SELECT id FROM Accounts WHERE "augustin.denuce@gmail.com" = email;


INSERT INTO Admins (id)
    SELECT id FROM Accounts WHERE "quentin82.donier@gmail.com" = email;
