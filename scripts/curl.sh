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
    query | q)
        echo $0 query domain 
        curl -i \
            -X POST http://localhost:5173/api/query/internship \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"domain\": \"$2\", \"date\": null, \"duration\": $3 }"
        ;;

# /* body: {
#     domain: "", // title exact
#     date: { // date of begining
#         min: unix-time, 
#         max: unix-time
#     },
#     duration: month,
#     fuzzy: "" // title / abstract 
# } */
# // --> [{ domain: "title", company: "name",  }]
# const duration_margin = 1;
# apiRouter.post('/query/internship', auth, (req: any, res: any) =>

    *)
        echo $0 '<logout|login>'
        ;;
esac