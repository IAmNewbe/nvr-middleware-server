## Files Overview

Within the download you'll find the following directories and files:

```
nvr-service-middleware
    |
    ├── src
    │   ├── api
    │   │   ├── authentications
    │   │   │   └── authentication.js
    │   │   ├── ftp
    │   │   │   ├── ftp.js
    │   │   │   └── RunFtp.js
    │   │   └── nvr_snapshot
    │   │       ├── Auth.js
    │   │       └── Snapshot.js   
    │   │   
    │   ├── service
    │   │   ├── inMemmory
    │   │   └── mysql
    │   │       ├── AuthenticationsService.js
    │   │       ├── Connection.js
    │   │       ├── TaskService.js
    │   │       └── UserService.js
    │   │
    │   └── Server.js
    |
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    └── README.md
```

## Env Example
```
PORT=
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=

# Database conf
HOST=
USER=
PASSWORD=
DATABASE=
```