#!/bin/bash


case $1 in
    setup)
        echo 'SETUP'
        rm var/db.db
        sqlite3 var/db.db < scripts/setup.sql
        chmod 777 var/db.db
        ;;
    erase_tokens)
        echo 'DELETE ALL CON TOKENS'
        sqlite3 -line var/db.db 'DELETE FROM Tokens;'
        ;;
    tokens)
        # sqlite3 -line var/db.db 'SELECT * FROM Tokens;'
                # t.expiration,
        sqlite3 -line var/db.db "SELECT 
                t.id,
                t.token,
                t.expiration,
                a.id   AS account_id,
                a.email AS account_email
            FROM Tokens t
            JOIN Accounts a ON a.id = t.account_id;"
        ;;
    test_accounts)
        echo 'reset accounts and create testing account with 1234 as password'
        sqlite3 var/db.db < scripts/test_accounts.sql
        ;;
    companies)
        echo 'COMPANIES'
        sqlite3 -line var/db.db 'SELECT * FROM Companies;'
        ;;
    admins)
        echo 'ADMINS'
        sqlite3 -line var/db.db 'SELECT * FROM Admins;'
        ;;
    accounts)
        sqlite3 -line var/db.db "
        SELECT a.id, a.email,
            CASE
                WHEN ad.id IS NOT NULL THEN 'Admin'
                WHEN c.id  IS NOT NULL THEN 'Company'
                WHEN s.id  IS NOT NULL THEN 'Student'
                WHEN su.id IS NOT NULL THEN 'Supervisor'
                WHEN p.id  IS NOT NULL THEN 'Person'
                ELSE 'Unknown'
            END AS kind,
            p.first_name,
            p.last_name,
            c.url_site,
            c.name_company
        FROM Accounts a
        LEFT JOIN Admins       ad ON ad.id = a.id
        LEFT JOIN Companies    c  ON c.id  = a.id
        LEFT JOIN Persons      p  ON p.id  = a.id
        LEFT JOIN Students     s  ON s.id  = a.id
        LEFT JOIN Supervisors  su ON su.id = a.id
        ORDER BY kind, a.id;
        "
        ;;
    stages)
        sqlite3 -line var/db.db "SELECT * FROM Internship;"
        ;;
    reset_stages)
        sqlite3 -line var/db.db "DELETE FROM Internship;"
        ;;
    domain)
        sqlite3 -line var/db.db "SELECT * FROM Domains;"
        ;;
    reset_domain)
        sqlite3 -line var/db.db "DELETE FROM Domains;"
        ;;
    *)
        echo unkown command
        ;;

esac

