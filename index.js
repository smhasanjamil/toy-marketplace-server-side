const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.g5cwrlz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();



        const carCollection = client.db("motorMart").collection("cars");


        // Indexing for search
        const indexKeys = { toyName: 1, subCategory: 1 };
        const indexOption = { name: "titleCategory" };
        const result = await carCollection.createIndex(indexKeys, indexOption);

        app.get('/car-search/:text', async (req, res) => {
            const searchText = req.params.text;

            const result = await carCollection.find({
                $or: [
                    { toyName: { $regex: searchText, $options: "i" } },
                    { subCategory: { $regex: searchText, $options: "i" } },
                ]
            }).toArray()
            res.send(result);

        })










        app.get('/all-cars', async (req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/all-cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const car = await carCollection.findOne(query);
            res.send(car);
        });


        // Find my to
        app.get('/all-car', async (req, res) => {
            // console.log(req.query.sellerEmail); 
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            const result = await carCollection.find(query).toArray();
            res.send(result);
        })



        // Add Toy
        app.post('/all-cars', async (req, res) => {
            const addToy = req.body;
            // console.log(addToy);

            const result = await carCollection.insertOne(addToy);
            res.send(result);
        })


        // Delete 
        app.delete('/all-cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.send(result);
        })


        // For update operation, find a specific id and details
        app.get('/all-cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.findOne(query);
            res.send(result);

        })

        // Update
        app.put('/all-cars/:id', async (req, res) => {
            const id = req.params.id;
            const car = req.body;
            // console.log(car);
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCar = {
                $set: {
                    price: car.price,
                    availableQuantity: car.availableQuantity,
                    description: car.description
                }
            }
            const result = await carCollection.updateOne(query, updatedCar, options);
            res.send(result);

        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send("Motor Mart is running");
});

app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});