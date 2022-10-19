const express = require('express')
const app = express()
const cors = require('cors');
const admin = require("firebase-admin");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET)

const port = process.env.PORT || 5000;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jy11d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken (req, res, next){

  if(req.headers?.authorization?.startsWith(`Bearer `)){
    const token = req.headers.authorization.split(' ')[1];
      try{
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch{

      }
    
  }
    next();
}

async function run() {
    try{
        await client.connect();
        const database = client.db('cctvcamera_products');
        const productsCollection = database.collection('products');
        const ordersCollection= database.collection("orders");
        const reviewsCollection = database.collection('Reviews');
        const usersCollection = database.collection('Users');

           // get api  
           app.get('/products',async(req,res)=>{
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        });

          //  get single product api 
        app.get('/products/:id',async(req,res)=>{
          const id = req.params.id;
          const query = { _id:ObjectId(id) };
          const product = await productsCollection.findOne(query);
          res.json(product);

          });
          // get single product  api 
        app.get('/singleProduct/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await productsCollection.findOne(query);
          res.json(result)

      })

           // update product api 
        app.put('/products/:id', async (req, res) => {
          const id = req.params.id;
          const updatedProduct = req.body;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true }
          const updateDoc = {
              $set: {
                  name: updatedProduct.name,
                  img: updatedProduct.img,
                  price: updatedProduct.price,
                  description: updatedProduct.description,
                  size:updatedProduct.size
              }
          }
          const result = await productsCollection.updateOne(filter, updateDoc, options)
          console.log(result)
          res.json(result)
      });


          
    //post order api 
  app.post("/orders", async (req, res) => {
    const result = await ordersCollection.insertOne(req.body);
    res.send(result);
  });

  ///get  all orders
  app.get("/orders", async (req, res) => {
    const result = await ordersCollection.find({}).toArray();
    res.send(result);
  });
  //Get single user orders
  app.get('/myOrders/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const order = await ordersCollection.find(query).toArray();
    res.send(order)
});

  // order status update api 
  app.put('/orderStatusUpdate/:id', async (req, res) => {
    const id = req.params.id;
    const newStatus = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatePackage = {
        $set: {
            status: newStatus.Status
        }
    }
    const result = await ordersCollection.updateOne(filter, updatePackage, options)
    res.json(result)
})

// get  sub catagories order  api 
app.get('/catagoriesOrder', async (req, res) => {
  const status = req.query.status;
  const query = { status: status };
  let cursor = {}
  if (status) {
      cursor = ordersCollection.find(query);
  } else {
      cursor = ordersCollection.find({});
  }
  const result = await cursor.toArray();
  res.json(result)
})

 //Delete Order
 app.delete('/orderDelete/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await ordersCollection.deleteOne(query);

  res.json(result)
 });
  
  // delete product  api 
  app.delete('/productDelete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productsCollection.deleteOne(query);
    res.json(result)
})


             // post api 
    app.post('/products',async(req,res)=>{
        const product = req.body;
        const result =await productsCollection.insertOne(product);
        res.json(result)
    });

    // reviews post api 
    app.post('/reviews', async (req, res) => {
      const data = req.body;
      const result = await reviewsCollection.insertOne(data);
      res.json(result);
  })
   // reviews get api 
   app.get('/reviews', async (req, res) => {
    const cursor = reviewsCollection.find({});
    const result = await cursor.toArray();
    res.json(result)
});


// user post api 
app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  res.json(result);
});
app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});
// search admin api 
app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  let isAdmin = false;
  if (user?.role === 'admin') {
      isAdmin = true;
  }
  res.json({ admin: isAdmin });
})

 // make admin 
 app.put('/users/admin',verifyToken, async(req,res)=>{
  const user = req.body;
  const requester= req.decodedEmail
  if(requester){
    const requesterAccount = await usersCollection.findOne({email:requester});
    if(requesterAccount.role === 'admin'){
      const filter = {email: user.email};
      const updateDoc = { $set: { role: 'admin'}};
      const result = await usersCollection.updateOne(filter,updateDoc);
      console.log(result)
      res.json(result)
    }
  }
  else{
    res.status(403).json({message:'You do not have permission to make an admin'})
  }
  
})
// pay post api 
// app.post('/create-payment-intent', async(req,res)=>{
//   const paymentInfo = req.body;
//   const amount = paymentInfo.price* 100;
//   const paymentIntent = await stripe.paymentIntents.create({
//     currency='usd',
//     amount: amount,
//     payment_method_types: ['card']
//   });
//   res.json({clientSecret: paymentIntent.client_secret})
// })

        
    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('cctv camera server is running!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})