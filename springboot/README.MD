# Time limit role based dynamic user access to MySQL databse
- the codes uses hashicorp to generate secrets using dynamic user roles to access MySQL
- vault runs in a container, which means you need docker install

## Steps

### Run the docker container (Powershell formatted)
```powershell
docker run -d `
  --name vault-dev `
  -p 8200:8200 `
  --cap-add=IPC_LOCK `
  -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' `
  -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' `
  hashicorp/vault:latest
```

### shell to the container
`docker exec -it vault-dev sh`

### execute these codes in the container
- Update your-root-password


```bash
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='myroot'

# Enable database secrets engine
vault secrets enable database

# Configure the MySQL connection — name it "lms" this time
vault write database/config/lms \
    plugin_name=mysql-database-plugin \
    connection_url="root:your-root-password@tcp(host.docker.internal:3306)/" \
    allowed_roles="my-app-role" \
    username="root" \
    password="your-root-password"

# Create the role — db_name now matches the connection name "lms"
vault write database/roles/my-app-role \
    db_name=lms \
    creation_statements="CREATE USER '{{name}}'@'%' IDENTIFIED BY '{{password}}'; GRANT ALL PRIVILEGES ON lms.* TO '{{name}}'@'%';" \
    revocation_statements="DROP USER IF EXISTS '{{name}}'@'%';" \
    default_ttl="1h" \
    max_ttl="24h"

# verify
vault read database/creds/my-app-role
```

