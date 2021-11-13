const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const ObjectId = require("mongodb").ObjectId;


const app = express()

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.3jq7x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run () {
    try{
        client.connect()
        const database = client.db('artisan-belize')
        const productCollection = database.collection('products')
        const customerCollection = database.collection('customers');
        const reviewCollection = database.collection('reviews')
        const usersCollection = database.collection('users');

        // products get api
        app.get('/products', async(req, res) => {
            const cursor = productCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        //review get api
        app.get('/review', async(req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        // single product get api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.json(result);
        })
        // single customer get api
        app.get('/customers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await customerCollection.findOne(query);
            res.json(result);
        })

        // get all orders
        app.get('/manageOrder', async(req, res) => {
            const cursor = customerCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        // get admin api
        app.get('/users/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true
            }
            res.json({admin: isAdmin})
        })

        // post product api
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.json(result);
        });

        // users post api
        app.post('/customers', async(req, res) => {
            const customer = req.body
            const result = await customerCollection.insertOne(customer)
            res.json(result)
        })

        // Review post api
        app.post('/reviews', async(req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.json(result)
        })

        // get all order by email query
        app.get("/myOrders/:email", (req, res) => {
            customerCollection.find({ email: req.params.email })
            .toArray((err, results) => {
                res.send(results);
            });
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
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

        // make admin
        app.put('/users/admin', async(req, res) => {
            const user = req.body
            const filter = {email: user.email}
            const updateDoc = {$set: {role: 'admin'}}
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        // update orders
        app.put('/updateorder/:id', async(req, res) => {
            const id = req.params.id
            const updateDoc = req.body;
            const filter = {_id: ObjectId(id)}
            const result = await customerCollection.updateOne(filter, {$set:{customerName: updateDoc.customerName, status: updateDoc.status}})
            res.json(result)
        })

        // update product api
        app.put('/updateproduct/:id', async(req, res) => {
            const id = req.params.id
            const updateDoc = req.body;
            const filter = {_id: ObjectId(id)}
            const result = await productCollection.updateOne(filter, {$set:{name: updateDoc.name, price: updateDoc.price, details: updateDoc.details}})
            res.json(result)
        })

        // delete orders 
        app.delete('/deleteorder/:id', async(req, res) => {
            const id = req.params.id
            const result = await customerCollection.deleteOne({_id: ObjectId(id)})
            res.json(result)
        })

        // delete Product api
        app.delete('/deleteproduct/:id', async(req, res) => {
            const id = req.params.id
            const result = await productCollection.deleteOne({_id: ObjectId(id)})
            res.json(result)
        })


    }
    finally{

    }

}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('hello from Artisan Belize')
})

app.listen(port, () => {
    console.log('hello', port)
})