
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
require('dotenv').config();

// DB_USER=ShoesWarehouse
// DB_PASS=rNvA7O7Vmr8NhVOD


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://ShoesWarehouse:rNvA7O7Vmr8NhVOD@cluster0.gfcfy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection = client.db("shoesWarehouse").collection("shoes");

        // get api to read all inventories product

        app.get("/shoes", async (req, res)=>{
            const query = req.query;
            console.log(query);
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();

            res.send(result)
        })

        // Create inventories product
        // localhost:5000/shoe

        app.post('/shoe', async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await productCollection.insertOne(data);
            res.send(result);
        })

        // Update inventories product

        app.put('/shoe/:id', async(req, res)=>{
            const id = req.params.id;
            const data = req.body;
            const filter = {_id: ObjectId(id)};
            const option = {upsert:true};
            const updateDoc = {
                $set:{
                    quantity: data.quantity
                }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);

            res.send(result)
        })



        // Delete inventories product
        console.log('connected to db');
    }
    finally{

    }
}

run().catch(console.dir)


/* client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
  console.log('connected to database')
}); */



app.get('/', (req, res) => {
    res.send('Running my code CRUD SERVER')
});
app.listen(port,()=>{
    console.log('Crud server is running');
})