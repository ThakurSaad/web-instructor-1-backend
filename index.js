const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Yn3ZNHGmlQZPz9Wd
// webUser

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://webUser:Yn3ZNHGmlQZPz9Wd@cluster0.ju9qt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("webInstructor").collection("users");
    console.log("mongo connected");
    // ------------------------------ PUT API ------------------------------

    // update user on registration
    app.put("/registration", async (req, res) => {
      const email = req.query.email;
      console.log(req.query, email);
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.send({ result, token });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bill Manager is working");
});

app.listen(port, (req, res) => {
  console.log("Bills are listening", port);
});
