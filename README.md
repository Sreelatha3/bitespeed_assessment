
1. No matching record for the contact details in the db.

curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \ 
-d '{"email": "test@example.com"}'

This will create a record in the db.


2. Matching record exists in the db,

curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d "{\"email\": \"sree@example.com\"}"
  
Returns the matching record


3. Matching email id and new phone number, this become secondary and links itself to the primary (or old matching email id record)

curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d "{\"email\": \"sree@example.com\",\"phoneNumber\":\"3874837433\"}"


4. Matching phone number and new email id, this record becomes the secondary record and links itself to the exists record with phonenumber

curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d "{\"email\": \"bob@example.com\",\"phoneNumber\":\"1234567890\"}" 


5. Email id matching one record and phonenumber to another record
Merge it with the oldest record

curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d "{\"email\":\"bob@example.com\",\"phoneNumber\":\"3874837433\"}"

