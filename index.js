import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors'
import 'dotenv/config'
import dns from 'node:dns';


dns.setServers(['8.8.8.8', '1.1.1.1']);
const app = express()
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json())

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j6ozu7e.mongodb.net/`);
export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.error('MongoDB connection failed:', err);

    }
}
const connectedClient = await connectToMongoDB();
const db = connectedClient.db('simpleCurdDB');
const users = db.collection('users');
app.get('/users', async (req, res) => {
    const cursor = users.find({});
    const allUsers = await cursor.toArray();
    res.send(allUsers)
})

app.get('/users/:id', async (req, res) => {
    console.log('parems in the server', req.params);
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await users.findOne(query);
    res.send(result)

})

app.get('/', (req, res) => {
    res.send('simple COUrd server is Running')
})
app.post('/users', async (req, res) => {
    const newUser = req.body;
    console.log('adding new user:', newUser);
    const resut = await users.insertOne(newUser);
    res.send(resut)

})

app.patch('/users/:id', async (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;
    console.log('updating user with Id', id, 'with data ', updatedUser);
    const filter = {
        _id: new ObjectId(id)
    }
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            name: updatedUser.name,
            email: updatedUser.email,

        }
    }
    const result = await users.updateOne(filter, updateDoc, options)
})

app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await users.deleteOne(query);
    res.send(result);
})


app.listen(port, () => {
    console.log(`simple CRud server is ruuning on Port:${port}`);

})