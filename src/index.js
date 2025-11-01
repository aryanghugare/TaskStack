import dotenv from 'dotenv'
import app from './app.js'
import connectDB from './db/index.js';

dotenv.config({
  path: "./.env"
});
const port = process.env.PORT || 3000

// Connect to MongoDB
connectDB()
.then(()=>{
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
})
.catch((error)=>{
  console.error("❌ MongoDB connection error:", error);

})
