# AutoVault — ER Diagram

## Entities

### User
| Field     | Type     | Constraints                        |
|-----------|----------|------------------------------------|
| _id       | ObjectId | PK, auto-generated                 |
| name      | String   | required, max 50                   |
| email     | String   | required, unique, lowercase        |
| password  | String   | required, bcrypt hashed            |
| role      | String   | enum: user/admin, default: user    |
| active    | Boolean  | default: true                      |
| createdAt | Date     | auto                               |
| updatedAt | Date     | auto                               |

### Car
| Field        | Type     | Constraints                                            |
|--------------|----------|--------------------------------------------------------|
| _id          | ObjectId | PK, auto-generated                                     |
| make         | String   | required, max 50                                       |
| model        | String   | required, max 50                                       |
| year         | Number   | required, min 1900                                     |
| color        | String   | required                                               |
| price        | Number   | required, min 0                                        |
| mileage      | Number   | required, min 0                                        |
| status       | String   | enum: available/sold/reserved/maintenance; default: available |
| condition    | String   | enum: new/used/certified; default: used                |
| fuelType     | String   | enum: gasoline/diesel/electric/hybrid; default: gasoline |
| transmission | String   | enum: automatic/manual; default: automatic             |
| vin          | String   | optional, unique, 17 chars, uppercase                  |
| description  | String   | optional, max 1000                                     |
| features     | [String] | optional array of feature strings                      |
| addedBy      | ObjectId | FK → User._id, required                               |
| createdAt    | Date     | auto                                                   |
| updatedAt    | Date     | auto                                                   |

## Relationships

```
User ──< Car
(one user can add many cars; each car has one owner)

User.role = 'admin' → can see and manage ALL cars
User.role = 'user'  → can only see and manage their own cars
```

## Indexes

- `Car`: `{ status, make }` — for status+make filter queries
- `Car`: `{ price }` — for price range queries
- `Car`: `{ year }` — for year range sort/filter
- `Car`: text index on `make`, `model`, `description` — for keyword search
- `Car.vin`: unique + sparse — allows null but enforces uniqueness when set
