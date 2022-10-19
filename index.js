const express = require('express');
const viewCount = require('./middleware/viewCount');
const rateLimit = require('express-rate-limit');
const ejs = require('ejs');
const productRoutes = require('./routes/v1/productRoute');
const dbConnect = require('./utils/dbConnect');

const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const app = express()
const port = process.env.PORT ||5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", ejs);

// app.use(limiter)
// at first call middleware before databse connected 
// app.use(viewCount)
// db connected
dbConnect();
//  product router connected 
app.use("/api/v1/products", productRoutes)

app.get('/', (req, res) => {
//   res.sendFile(__dirname + "/public/test.html")
    res.render("home.ejs",{
        "id": 2
    })
})

app.all("*", (req,res)=>{
    res.send("No route Found")
})
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// global error handler 

process.on("unhandledRejection", (error) =>{
    console.log(error.name, error.message);
    app.close(()=>{
        process.exit(1)
    })
})