# Time limit role based dynamic user access to MySQL databse using vault
- To improve security access to mysql database, vault is setup to keep secrets
- the codes uses hashicorp to generate secrets using dynamic user roles to access MySQL
- docker compoose file is setup to persist the database connection secrets since we are running in dev mode which means the secrets don't persist over shutdown.

## Steps

### Run the docker container (Powershell formatted)
```bash
cd /vault

# create a .env file with the following (the file is gitignored)
MYSQL_ROOT_PASSWORD=your_root_password
VAULT_ROOT_TOKEN=myroot

# in the same folder run
docker compose up -d

# to verify, shell to the container
docker exec -it <vault name> sh

vault read database/creds/my-app-role
# or use URL http://localhost:8200/

# at the end of day
docker compose down
```

