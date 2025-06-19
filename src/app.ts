
import express from 'express'
import 'dotenv/config'
import apiRoutes from './routes/api';
const app = express()


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

    next();
})


// config routes
apiRoutes(app);




app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})