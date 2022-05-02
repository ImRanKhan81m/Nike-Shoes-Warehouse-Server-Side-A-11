
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
const jwt = require('jsonwebtoken');
app.use(express.json());
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access :)')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send('Forbidden access')
        }
        console.log(decoded, decoded.email);
        req.decoded = decoded;
        next();
    })
    
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gfcfy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db("shoesWarehouse").collection("shoes");


        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        // get api to read all inventories product
        app.get("/shoes", async (req, res) => {
            // const email = req.query.email;
            // console.log(email);
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();

            res.send(result)
        })

        app.get("/shoe", verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }
            else{
                res.status(403).send('forbidden access')
            }
        })

        app.get('/shoes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.send(service);
        });

        // Create inventories product 
        // localhost:5000/shoe

        app.post('/shoes', async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await productCollection.insertOne(data);
            res.send(result);
        })

        // Update inventories product

        app.put('/shoes/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const data = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data.quantity
                }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // Delete inventories product

        app.delete('/shoes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(filter);
            res.send(result);
        })




        console.log('connected to db');
    }
    finally {

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
app.listen(port, () => {
    console.log('Crud server is running');
})