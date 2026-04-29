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
            -d "{ \"title\": \"$2\", \"abstract\": \"$3\", \"domain\": \"$4\" }"
        ;;

    del_internship | di)
        curl -i \
            -X DELETE http://localhost:5173/api/company/internship \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\" }"
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

    del_domain | dd)
        curl -i \
            -X DELETE http://localhost:5173/api/admin/domain \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\" }"
        ;;

    list_domains | ld)
        curl -i \
            -X GET http://localhost:5173/api/query/domains \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;

    query | q)
        curl -i \
            -X POST http://localhost:5173/api/query/internship \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"domain\": \"$2\", \"date\": null, \"duration\": $3 }"
        ;;
    


    # COMPANY

    list_internships | li)
        curl -i \
            -X GET http://localhost:5173/api/company/internship \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;
    # $2 = internship title (URL-encoded if spaces)
    list_applicants | lap)
        curl -i \
            -X GET "http://localhost:5173/api/company/applicants/$(python3 -c "import urllib.parse; print(urllib.parse.quote('$2'))")" \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;
    # $2 = title  $3 = min_begin (unix)  $4 = max_begin (unix)  $5 = duration (months)
    update_dates | upd)
        curl -i \
            -X PUT http://localhost:5173/api/company/internship/dates \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\", \"min_begin\": $3, \"max_begin\": $4, \"duration\": $5 }"
        ;;

    # STUDENT

    apply | ap)
        # $2 = internship title
        curl -i \
            -X POST http://localhost:5173/api/student/apply \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"title\": \"$2\" }"
        ;;
    my_applications | ma)
        curl -i \
            -X GET http://localhost:5173/api/student/applications \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;
    submit_doc | sd)
        # $2 = internship title  $3 = filename  $4 = type (rapport|resume|evaluation)
        curl -i \
            -X POST http://localhost:5173/api/student/document \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"internship_title\": \"$2\", \"filename\": \"$3\", \"type\": \"$4\" }"
        ;;
    request_domain | rd)
        # $2 = domain name to request
        curl -i \
            -X POST http://localhost:5173/api/student/request/domain \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"domain\": \"$2\" }"
        ;;

    # SUPERVISOR

    my_students | ms)
        curl -i \
            -X GET http://localhost:5173/api/supervisor/students \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;
    # $2 = application_id  $3 = status (accepted|rejected|validated)
    set_status | ss)
        curl -i \
            -X PUT http://localhost:5173/api/supervisor/application/status \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"application_id\": $2, \"status\": \"$3\" }"
        ;;

    # REMARQUES

    add_remark | ar)
        # $2 = application_id  $3 = content
        curl -i \
            -X POST http://localhost:5173/api/remark \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt \
            -d "{ \"application_id\": $2, \"content\": \"$3\" }"
        ;;
    get_remarks | gr)
        # $2 = application_id
        curl -i \
            -X GET "http://localhost:5173/api/remark/$2" \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;

    # ME

    me)
        curl -i \
            -X GET http://localhost:5173/api/me \
            -H "Content-Type: application/json; charset=UTF-8" \
            -b ./scripts/curl/cookies.txt
        ;;

    *)
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Auth:"
        echo "  login|in       <email_prefix>          login (appends @gmail.com)"
        echo "  logout|out                              logout"
        echo "  me                                      infos du compte connecté"
        echo ""
        echo "Domains:"
        echo "  list_domains|ld                         lister les domaines"
        echo "  new_domain|nd  <title> <abstract>       créer un domaine (admin)"
        echo "  update_domain|ud <old> <new> <abstract> modifier un domaine (admin)"
        echo "  del_domain|dd  <title>                  supprimer un domaine (admin)"
        echo ""
        echo "Admin:"
        echo "  list_accounts|la                        lister les comptes"
        echo "  list_domain_requests|ldr                demandes de domaines en attente"
        echo "  handle_domain_request|hdr <1|0> <id> <title> <abstract>"
        echo "                                          accepter(1) ou refuser(0) une demande"
        echo ""
        echo "Company:"
        echo "  new_internship|ni  <title> <abstract> <domain>"
        echo "  del_internship|di  <title>"
        echo "  list_internships|li                     ses offres"
        echo "  list_applicants|lap <title>             candidats sur une offre"
        echo "  update_dates|upd <title> <min> <max> <duration>"
        echo ""
        echo "Student:"
        echo "  apply|ap       <internship_title>       postuler"
        echo "  my_applications|ma                      suivre ses candidatures"
        echo "  submit_doc|sd  <internship> <file> <type>"
        echo "  request_domain|rd <domain>              demander un nouveau domaine"
        echo ""
        echo "Supervisor:"
        echo "  my_students|ms                          voir ses étudiants"
        echo "  set_status|ss  <application_id> <status>"
        echo ""
        echo "Remarks:"
        echo "  add_remark|ar  <application_id> <content>"
        echo "  get_remarks|gr <application_id>"
        echo ""
        echo "Query:"
        echo "  query|q        <domain> <duration>"
        ;;
esac