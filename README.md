# Image Server
## Introduction
This is a basic image server that can be used to serve images. I designed this for use with a modified Gyazo frontend.

## Environment Variables
This application takes in configuration through environment variables.  

### ALLOWED_IPS
You will need to change this. By default, others are not able to upload to this server (for security reasons, the upload backend isn't too well battle tested). Set this to a comma separated list of IPs which are allowed to upload. For example: `localhost,192.168.1.1,1.1.1.1`. Set this to `*` to allow all connections (NOT RECOMMENDED).
### DATABASE
For example, `postgres://user:pass@example.com:5432/dbname` for use with pgSql, or `mariadb://user:pass@example.com:5432/dbname`. If this variable is not provided, it will fallback to an in-memory SQLite database.  
### CLEANUP
By default, this server automatically cleans up after a time span of 7 days. This variable can be changed to modify this behavior. Set to `-1` to disable, otherwise, set to `INTERVAL,MAX_AGE`. Both values are in milliseconds. For example, you can use `3600000,604800000` to clean every 3600000ms, and delete files older than 604800000ms.