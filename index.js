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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://webUser:Yn3ZNHGmlQZPz9Wd@cluster0.ju9qt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("webInstructor").collection("users");
    const billingCollection = client.db("webInstructor").collection("billings");
    console.log("mongo connected");

    // ------------------------------ GET API ------------------------------

    // full billing list
    app.get("/billing-list", verifyJWT, async (req, res) => {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
      console.log(req.query, page, pageSize);
      const cursor = billingCollection.find();

      let billingList;
      if (page || pageSize) {
        billingList = await cursor
          .skip(page * pageSize)
          .limit(pageSize)
          .toArray();
      } else {
        billingList = await cursor.toArray();
      }

      res.send(billingList.reverse());
    });

    // count number of billings
    app.get("/billing-count", async (req, res) => {
      const billingCount = await billingCollection.estimatedDocumentCount();
      res.send({ billingCount });
    });

    // ------------------------------ POST API ------------------------------

    // add new billing
    app.post("/add-billing", verifyJWT, async (req, res) => {
      const bill = req.body;
      const result = await billingCollection.insertOne(bill);
      res.send(result);
    });

    // ------------------------------ PUT API ------------------------------

    // update user on registration
    app.put("/registration", async (req, res) => {
      const email = req.query.email;
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

    // Update billing
    app.put("/update-billing/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const bill = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: bill,
      };
      const result = await billingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // ------------------------------ DELETE API ------------------------------

    // delete billing
    app.delete("/delete-billing/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const deleteBilling = { _id: ObjectId(id) };
      const result = await billingCollection.deleteOne(deleteBilling);
      res.send(result);
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
