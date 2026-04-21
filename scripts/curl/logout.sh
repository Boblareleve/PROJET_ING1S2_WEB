

# reuse cookie on subsequent requests
curl -X DELETE http://localhost:5173/auth/logout \
  -H "Content-Type: application/json; charset=UTF-8" \
  -b ./scripts/curl/tmp/cookies.txt
