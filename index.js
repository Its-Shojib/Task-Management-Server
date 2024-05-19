const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
let cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000

/* Using Middleware */
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://task-master-web.netlify.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


/* Starting MongoDB */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oglq0ui.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const taskCollection = client.db("Task-Management-DB").collection('Current-Task');

        //Create a new Task
        app.post("/create-task",  async (req, res) => {
            let newTask = req.body;
            let result = await taskCollection.insertOne(newTask);
            res.send(result);
        });

        //Load all the Tasks
        app.get("/load-task/:email", async (req, res) => {
            let email = req.params.email;
            let query = { email: email };
            let result = await taskCollection.find(query).toArray();
            res.send(result);
        });

        //Update a Task
        app.get('/update-task/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await taskCollection.findOne(query);
            res.send(result);
        });

        //Delete a Task
        app.delete('/delete-task/:id',  async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await taskCollection.deleteOne(query);
            res.send(result);
        });

        //Change the Status of a Task
        app.put('/change-state/:id',  async (req, res) => {
            let id = req.params.id;
            let newStatus = req.body;
            let query = { _id: new ObjectId(id) };
            let updatedDoc = {
                $set: {
                    taskStatus: newStatus.status
                }
            }
            let result = await taskCollection.updateOne(query, updatedDoc);
            res.send(result);
        });

        //Update a single task
        app.put('/update-single-task/:id',  async (req, res) => {
            let id = req.params.id;
            let updatedTask = req.body;
            let query = { _id: new ObjectId(id) };
            let updatedDoc = {
                $set: {
                    taskName: updatedTask.taskName,
                    desc: updatedTask.desc,
                    date: updatedTask.date,
                    priority: updatedTask.priority,
                }
            }
            let result = await taskCollection.updateOne(query, updatedDoc);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task is Managing!')
})

app.listen(port, () => {
    console.log(`Task Management listening on port ${port}`)
})