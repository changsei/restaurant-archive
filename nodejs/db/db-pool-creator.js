const mysql = require('mysql2/promise');

const host = "localhost";
const user = "root";
const password = "1111";
const database = "restaurant_archive";

const dbPool = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    connectTimeout: 5000,
    connectionLimit: 10,
})

module.exports = dbPool;