// Get the client
import mysql from 'mysql2/promise';
import 'dotenv/config'

const getConnection = async () => {
    // Create the connection to database
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
}



export default getConnection;