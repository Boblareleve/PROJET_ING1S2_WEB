#!/bin/bash

case $1 in 
    login | in)
        curl -i \
            -X POST http://localhost:5173/auth/login \
            -H 'Content-Type: application/json' \
            -d "{\"email\": \"$2@gmail.com\", \"password\": \"1234\"}" \
            -c ./scripts/curl/cookies.txt
        ;;
    logout | out)
        curl -i \
            -X DELETE http://localhost:5173/auth/logout \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt

        ;;
    new_internship | ni)
        curl -i \
            -X POST http://localhost:5173/api/company/internship \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\", \"abstract\": \"$3\" }"
        ;;
    del_internship | di)
        curl -i \
            -X DELETE http://localhost:5173/api/company/internship \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ title: \"$2\" }"
        ;;
    new_domain | nd)
        curl -i \
            -X POST http://localhost:5173/api/admin/domain \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\", \"abstract\": \"$3\" }"
        ;;
    update_domain | ud)
        curl -i \
            -X PUT http://localhost:5173/api/admin/domain \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\", \"new\": { \"title\": \"$3\", \"abstract\": \"$4\" } }"
        ;;

# /* body: {
#     title: ""
#     abstract: ""
# } */
# apiRouter.post('/admin/domain', auth, (req: any, res: any) =>
# {
#     const full_account = get_full_account(req.email);
#     if (typeof full_account == 'string')
#         return res.status(401).send("failed too find admin account informations");
#     if (full_account.role !== ROLE.ADMIN)
#         return res.status(401).send("only admin can add domain");
#     if (db_run(db, `
#             INSERT INTO Domains (title, abstract)
#             VALUES (?, ?);
#             `,
#             [req.body.title, req.body.abstract]
#         ) !== null
#     ) {
#         return res.status(401).send("con't add domain: '" + req.body.title + "'");
#     }
#     res.send();
# });
# /* body: {
#     title: ""
#     abstract: ""
# } */
# apiRouter.put('/admin/domain', auth, (req: any, res: any) =>
# {
#     const full_account = get_full_account(req.email);
#     if (typeof full_account == 'string')
#         return res.status(401).send("failed too find admin account informations");
#     if (full_account.role !== ROLE.ADMIN)
#         return res.status(401).send("only admin can add domain");
#     if (db_run(db, `
#             UPDATE Domains 
#             SET
#                 title = ?,
#                 abstract = ?
#             WHERE
#                 title = ?;
#             `,
#             [req.body.title, req.body.abstract, req.body.title]
#         ) !== null
#     ) {
#         return res.status(401).send("can't update domain: '" + req.body.title + "'");
#     }
#     res.send();
# });
    *)
        echo $0 '<logout|login>'
        ;;
esac