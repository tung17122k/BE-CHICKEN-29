/// <reference path="./types/index.d.ts" />
import express from 'express'
import 'dotenv/config'
import apiRoutes from './routes/api';
import getConnection from './config/database';
import "./config/passport"
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import initDatabase from './config/seed';


const app = express()


// config cors 
app.use(cors({

}))

// config req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// config cookie parser
app.use(cookieParser());

//config view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

//config static files
app.use(express.static("public"))

app.use(passport.initialize());

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

// seeding database
initDatabase()



app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})