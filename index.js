const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8uqfa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        
        await client.connect();
        const database = client.db('shoe_zoon');
        const allProductCollection = database.collection('shoe_products');
        const allOrderCollection = database.collection('allOrder');
        const usersCollection = database.collection('users');

        // get all products
        app.get('/allProducts', async (req, res) => {
            const products = await allProductCollection.find({}).toArray();
            res.send(products);
        });

        // get limited products
        app.get('/topProduct', async (req, res) => {
            const products = await allProductCollection.find().limit(6).toArray();
            res.send(products);

        });

        // get specific product
        app.get('/orderProduct/:orderItemId', async (req, res) => {
            const id = req.params.orderItemId;
            const query = { _id: ObjectId(id) };
            const product = await allProductCollection.findOne(query);
            res.json(product);
            
        });

        // post all order
        app.post('/allOrder', async (req, res) => {
            const result = await allOrderCollection.insertOne(req.body);
            res.send(result);
        });

        // get all order
        app.get('/allOrder', async (req, res) => {
            const result = await allOrderCollection.find({}).toArray();
            res.send(result);
        })

        // Delete my order
        app.delete("/deleteMyOrder/:id", async (req, res) => {
            const result = await allOrderCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        })

        //save user
        app.post('/addUser', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(user);
            res.json(result);
        })

        // update ordered product status
        app.put("/updateStatus/:id", async (req, res) => {
            const id = req.params.id;
            
            const filter = { _id: ObjectId(id) };

            allOrderCollection.updateOne(filter, {
                $set:{status: 'Shipped'}
            })
                .then(result => {
                    res.send(result);
                })
        })

        // Delete Order
        app.delete("/deleteOrder/:id", async (req, res) => {
            const result = await allOrderCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        });


        // check existing person who want make admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        
        // make user an admin
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Running shoe-zone assignment server')
});
app.listen(port, () => {
    console.log('Running shoe-zone assignment server', port);
})