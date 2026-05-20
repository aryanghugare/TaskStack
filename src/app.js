import express from 'express'
const app = express()
import cors from 'cors'
import cookieParser from 'cookie-parser'



// basic configurations 
app.use(express.json({ limit: '16kb'})) // To handle JSON payloads
// app.use is added here is a middleware to parse JSON bodies
app.use(express.urlencoded({extended:true , limit: '16kb'})) 
app.use(express.static('public')) // To serve static files from the 'public' directory

// cors configuration
app.use(cors({
origin: process.env.CORS_ORIGIN?.split(',') || 'https://localhost:5173',
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(cookieParser()) // To parse cookies from incoming requests

// import the routes
// This is done after all the configurations
import healthcheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/projects", projectRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})


export default app