# Let's build a server for food delivery service!

## Stacks

- Typescript
- NestJS
- TypeORM
- GraphQL
- PostgreSQL

## What are we going to build:

- [x] Authentication: Users can create account and sign in
- [x] Roles: Users can permanently switch their role from Regular users to Restaurant Owner
- [x] Restaurants: Restaurant Owners can create restaurants to start selling their delicious meals. Must include name and description.
- [x] Dish: Restaurant Owners can CRUD dish to their restaurant by adding: Image, Price, Name, Description
- [ ] Cart: Users can add, view update, remove items from their cart. On reading cart, it will calculate the total price cart for users.
  - View cart: Calculate price, show restaurant and all items in cart
  - Add Item: If item is from a different restaurant, remove all current items before adding
- [ ] Orders: Users can place order and both Regular users and Restaurant Owner can see this order and update status of the order
- [ ] Orders activities: Only Read and Add required. Users can see list of status changes history of an order
- [ ] Blocked Users: Restaurant Owners can choose to block a user

## How to use this server

npm run start:dev
