

/account/supervisor
/account/students
/account/company


/stages/




POST /login    
body: {
    email: ".*@.*\..*",
    password: ".*"
}
-> cookies: "token_access":  "..."
            "token_refresh": "..."




DELETE /logout
need: cookies: "token_access":  "..."
               "token_refresh": "..."


