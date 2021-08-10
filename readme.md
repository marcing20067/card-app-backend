# Card App Backend

## About project

Lorem ipsum 

## Routes

- POST /login - To login user
- POST /signup - To create account
- GET /sets - To get all sets for user²
- GET /sets/:setIndex - Get one set ¹²
- DELETE /sets/:setIndex - Delete one set¹²
- PUT /sets/:setIndex - Edit one set¹²
- POST /sets - To add new set²

¹ Set is selected by index(sets are array)
² Here we need the user ID that is in the jwt token

