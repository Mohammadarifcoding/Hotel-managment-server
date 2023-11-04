const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000
const cors  = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cookieParser = require('cookie-parser')



app.use(cors())
app.use(express.json())
app.use(cookieParser())

// Eleven-Assignment
// T81vKy5a32hRzCQI



const uri = "mongodb+srv://Eleven-Assignment:T81vKy5a32hRzCQI@cluster0.pdvgnv8.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

    // Collection

 const ServiceCollection =  client.db('ElevenAssignment').collection('services')

async function run() {
  try {


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get('/api/v1/services',async(req,res)=>{
        const result = await ServiceCollection.find().toArray()
        res.send(result)
    })
    app.post('/api/v1/services',async(req,res)=>{
        const data = req.body
        const result = await ServiceCollection.insertOne(data)
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})