# Release Note

## v1.4.0
- NEW: dev-vault is now required to run springboot, as it will syn with mysql to acquire a dynamic user for database login
  - checkout ./springboot/VAULT_SETUP.MD
- ADD: JWT token (no password yet) auth to REST API
- FIX: Error msg when trying to delete a user with borrow history


## v1.3.0
- Full working version
- included tests are working in both springboot and react
- Read the documents in folder to understand how the app runs
- super@admin.com user was added to allow easy edit of dates for me to simulate due dates and membership expiry

