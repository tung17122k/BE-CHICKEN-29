/// <reference path="./types/index.d.ts" />
import express from 'express'
import 'dotenv/config'
import apiRoutes from './routes/api';
import getConnection from './config/database';
import cors from 'cors';


const app = express()


// config cors 
app.use(cors())

// config req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//config view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

//config static files
app.use(express.static("public"))

// config global middleware
app.use((req, res, next) => {
    // res.locals.user = req.user || null;
    next();
})


// config routes
apiRoutes(app);


// seeding database 


// connect to database
getConnection()




app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})