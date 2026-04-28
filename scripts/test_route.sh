#!/bin/bash

SCRIPT="./scripts/curl.sh"
PASS=0
FAIL=0

# colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

expect()
{
    local label="$1"
    local expected_code="$2"
    shift 2
    local response
    response=$("$@" 2>/dev/null)
    local actual_code
    actual_code=$(echo "$response" | grep "^HTTP" | tail -1 | awk '{print $2}')

    if [ "$actual_code" = "$expected_code" ]; then
        echo -e "${GREEN}[PASS]${NC} $label (HTTP $actual_code)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}[FAIL]${NC} $label — expected HTTP $expected_code, got HTTP $actual_code"
        FAIL=$((FAIL + 1))
    fi
}

section()
{
    echo ""
    echo -e "${YELLOW}=== $1 ===${NC}"
}

# SETUP
# we use separate cookie jars so sessions don't collide
COOKIES_ADMIN="./scripts/curl/cookies_admin.txt"
COOKIES_COMPANY="./scripts/curl/cookies_company.txt"
COOKIES_STUDENT="./scripts/curl/cookies_student.txt"
COOKIES_ANON="./scripts/curl/cookies_anon.txt"
COOKIES_SUPERVISOR="./scripts/curl/cookies_supervisor.txt"

BASE="http://localhost:8000"

curl_as() {
    # curl_as <cookie_jar> <method> <path> [body]
    local jar="$1"; local method="$2"; local path="$3"; local body="$4"
    if [ -n "$body" ]; then
        curl -si -X "$method" "$BASE$path" \
            -H "Content-Type: application/json" \
            -b "$jar" -c "$jar" \
            -d "$body"
    else
        curl -si -X "$method" "$BASE$path" \
            -H "Content-Type: application/json" \
            -b "$jar" -c "$jar"
    fi
}

login_as() {
    local jar="$1"; local email="$2"
    curl -si -X POST "$BASE/auth/login" \
        -H "Content-Type: application/json" \
        -c "$jar" \
        -d "{\"email\": \"$email\", \"password\": \"1234\"}" > /dev/null
}

http_code() {
    echo "$1" | grep "^HTTP" | tail -1 | awk '{print $2}'
}

check() {
    local label="$1"; local expected="$2"; local response="$3"
    local actual
    actual=$(http_code "$response")
    if [ "$actual" = "$expected" ]; then
        echo -e "${GREEN}[PASS]${NC} $label (HTTP $actual)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}[FAIL]${NC} $label — expected $expected, got $actual"
        echo "       response: $(echo "$response" | tail -3)"
        FAIL=$((FAIL + 1))
    fi
}

# LOGIN
section "Login"

login_as "$COOKIES_ADMIN"      "a@gmail.com"
login_as "$COOKIES_COMPANY"    "c@gmail.com"
login_as "$COOKIES_STUDENT"    "e@gmail.com"
login_as "$COOKIES_SUPERVISOR" "s@gmail.com"

check "admin login" "200" \
    "$(curl_as "$COOKIES_ADMIN" GET /api/me)"

check "company login" "200" \
    "$(curl_as "$COOKIES_COMPANY" GET /api/me)"

check "anon blocked on /api/me" "401" \
    "$(curl_as "$COOKIES_ANON" GET /api/me)"


# DOMAINS
section "Domains — admin CRUD"

check "list domains (authenticated)" "200" \
    "$(curl_as "$COOKIES_ADMIN" GET /api/query/domains)"

check "list domains (anon blocked)" "401" \
    "$(curl_as "$COOKIES_ANON" GET /api/query/domains)"

check "create domain as admin" "200" \
    "$(curl_as "$COOKIES_ADMIN" POST /api/admin/domain \
        '{"title":"Test Domain","abstract":"a test domain"}')"

check "create duplicate domain fails" "409" \
    "$(curl_as "$COOKIES_ADMIN" POST /api/admin/domain \
        '{"title":"Test Domain","abstract":"duplicate"}')"

check "update domain as admin" "200" \
    "$(curl_as "$COOKIES_ADMIN" PUT /api/admin/domain \
        '{"title":"Test Domain","new":{"title":"Test Domain v2","abstract":"updated"}}')"

check "company cannot create domain" "401" \
    "$(curl_as "$COOKIES_COMPANY" POST /api/admin/domain \
        '{"title":"Hacked Domain","abstract":""}')"

check "delete domain as admin" "200" \
    "$(curl_as "$COOKIES_ADMIN" DELETE /api/admin/domain \
        '{"title":"Test Domain v2"}')"

check "delete nonexistent domain fails" "404" \
    "$(curl_as "$COOKIES_ADMIN" DELETE /api/admin/domain \
        '{"title":"ghost"}')"


# INTERNSHIPS
section "Internships — company"

curl_as "$COOKIES_ADMIN" POST /api/admin/domain \
    '{"title":"Informatique","abstract":"IT domain"}' > /dev/null

check "company creates internship" "200" \
    "$(curl_as "$COOKIES_COMPANY" POST /api/company/internship \
        '{"title":"Dev Backend","abstract":"Node.js stuff","domain":"Informatique"}')"

check "duplicate title gets renamed (still 200)" "200" \
    "$(curl_as "$COOKIES_COMPANY" POST /api/company/internship \
        '{"title":"Dev Backend","abstract":"another one","domain":"Informatique"}')"

check "admin cannot create internship" "401" \
    "$(curl_as "$COOKIES_ADMIN" POST /api/company/internship \
        '{"title":"Admin Stage","abstract":"","domain":"Informatique"}')"

check "unknown domain rejected" "400" \
    "$(curl_as "$COOKIES_COMPANY" POST /api/company/internship \
        '{"title":"Ghost Stage","abstract":"","domain":"DoesNotExist"}')"

check "company lists own internships" "200" \
    "$(curl_as "$COOKIES_COMPANY" GET /api/company/internship)"

check "admin cannot list company internships" "401" \
    "$(curl_as "$COOKIES_ADMIN" GET /api/company/internship)"

check "company updates dates" "200" \
    "$(curl_as "$COOKIES_COMPANY" PUT /api/company/internship/dates \
        '{"title":"Dev Backend","min_begin":1700000000,"max_begin":1710000000,"duration":3}')"

check "query internship by domain" "200" \
    "$(curl_as "$COOKIES_ADMIN" POST /api/query/internship \
        '{"domain":"Informatique","date":null,"duration":null}')"

check "company deletes internship" "200" \
    "$(curl_as "$COOKIES_COMPANY" DELETE /api/company/internship \
        '{"title":"Dev Backend - 1"}')"


# STUDENT APPLY
section "Student — apply & documents"

# grab the internship id for "Dev Backend"
INTERNSHIP_ID=$(curl_as "$COOKIES_ADMIN" POST /api/query/internship \
    '{"domain":"Informatique","date":null,"duration":null}' \
    | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$INTERNSHIP_ID" ]; then
    echo -e "${YELLOW}[SKIP]${NC} Could not find internship id — student tests skipped"
else
    check "student applies" "200" \
        "$(curl_as "$COOKIES_STUDENT" POST /api/student/apply \
            "{\"internship_id\":$INTERNSHIP_ID}")"

    check "student double-apply rejected" "409" \
        "$(curl_as "$COOKIES_STUDENT" POST /api/student/apply \
            "{\"internship_id\":$INTERNSHIP_ID}")"

    check "student views applications" "200" \
        "$(curl_as "$COOKIES_STUDENT" GET /api/student/applications)"

    check "company cannot apply" "403" \
        "$(curl_as "$COOKIES_COMPANY" POST /api/student/apply \
            "{\"internship_id\":$INTERNSHIP_ID}")"

    check "apply to nonexistent internship" "404" \
        "$(curl_as "$COOKIES_STUDENT" POST /api/student/apply \
            '{"internship_id":99999}')"
fi


# ADMIN accounts
section "Admin — accounts"

check "admin lists accounts" "200" \
    "$(curl_as "$COOKIES_ADMIN" GET /api/admin/accounts)"

check "company cannot list accounts" "401" \
    "$(curl_as "$COOKIES_COMPANY" GET /api/admin/accounts)"


# SUPERVISOR
section "Supervisor"


check "supervisor lists students" "200" \
    "$(curl_as "$COOKIES_SUPERVISOR" GET /api/supervisor/students)"

check "company cannot list supervisor students" "403" \
    "$(curl_as "$COOKIES_COMPANY" GET /api/supervisor/students)"


# LOGOUT
section "Logout"

check "admin logout" "200" \
    "$(curl -si -X DELETE "$BASE/auth/logout" -b "$COOKIES_ADMIN")"


# SUMMARY
echo ""
echo "--------------------------------"
TOTAL=$((PASS + FAIL))
echo -e "Results: ${GREEN}$PASS passed${NC} / ${RED}$FAIL failed${NC} / $TOTAL total"
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed.${NC}"
fi
