const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assignment-project-60ccf.web.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Eleven-Assignment
// T81vKy5a32hRzCQI

const uri = `mongodb+srv://${process.env.VITE_USERNAME}:${process.env.VITE_PASS}@cluster0.pdvgnv8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, "fff", (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

// Collection

const ServiceCollection = client.db("ElevenAssignment").collection("services");
const RoomsCollection = client.db("ElevenAssignment").collection("Rooms");
const SeatCollection = client.db("ElevenAssignment").collection("Seats");
const Booked = client.db("ElevenAssignment").collection("Booked");
const ReviewCollection = client.db("ElevenAssignment").collection("reviews");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    app.get("/api/v1/myBookings", verifyToken, async (req, res) => {
      console.log(req.user.email);
      console.log(req.query.email);
      if (req.user.email !== req.query.email) {
        return res.status(401).send({ message: "Forbidden Acess" });
      }
      const userEmail = req.query.email;
      const query = { email: userEmail };
      const result = await Booked.find(query).toArray();
      res.send(result);
    });

    app.delete("/api/v1/deleteBookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Booked.deleteOne(query);
      res.send(result);
    });

    //  app.put('/api/v1/makeAvailable/:id',async(req,res)=>{
    //   const id = req.params.id
    //   const available = req.body.available
    //   const query = { _id : new ObjectId(id)}
    //   const option = {upsert : true}
    //   const value = {
    //     $set:{
    //        available : available
    //     }
    //   }
    //   const result = await SeatCollection.updateOne(query,value,option)
    //   res.send(result)
    //  })

    app.put("/api/v1/UpdateAvailability/:seatid", async (req, res) => {
      const seatId = req.params.seatid;
      const query = { seatId: seatId };
      const value = {
        $set: {
          available: true,
        },
      };
      const option = { upsert: true };
      const result = await SeatCollection.updateOne(query, value, option);
      res.send(result);
    });

    app.get("/api/v1/reviews", async (req, res) => {
      const result = await ReviewCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/v1/perReviews/:roomId", async (req, res) => {
      const roomId = req.params.roomId;
      const query = { roomID: roomId };
      const result = await ReviewCollection.find(query).toArray();
      res.send(result);
    });

    // app.post('/api/v1/Allreviews',async(req,res)=>{
    //   const body = req.boyd
    // })

    app.put("/api/v1/UpdateBooking/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body.startDate;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: false };
      const setData = {
        $set: {
          bookedDate: data,
        },
      };
      const result = await Booked.updateOne(query, setData, option);
      res.send(result);
    });

    app.post("/api/v1/postReview", async (req, res) => {
      const body = req.body;
      const result = await ReviewCollection.insertOne(body);
      res.send(result);
    });

    app.get("/api/v1/getReviews/:roomId", async (req, res) => {
      const roomId = req.params.roomId;
      console.log(roomId);
      const query = { roomID: roomId };
      console.log(query);
      const result = await ReviewCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, "fff", { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.get("/api/v1/rooms", async (req, res) => {
      const sort = {};
      if (req.query.order == "asec") {
        sort.priceRange = 1;
      } else if (req.query.order == "desc") {
        sort.priceRange = -1;
      }
      console.log(sort);

      const result = await RoomsCollection.find().sort(sort).toArray();
      res.send(result);
    });

    app.get("/api/v1/getBookingByEmailId", async (req, res) => {
      const email = req.query.email;
      const RoomId = req.query.roomId;
      const query = { email: email, roomId: RoomId };
      const result = await Booked.find(query).toArray();
      res.send(result);
    });

    app.get("/api/v1/seats/:roomId", async (req, res) => {
      const parameter = req.params.roomId;
      console.log(parameter);
      const query = { roomId: parameter };
      const result = await SeatCollection.find(query).toArray();
      console.log(result);

      res.send(result);
    });

    app.get("/api/v1/:Id", async (req, res) => {
      const Id = req.params.Id;
      const query = { _id: new ObjectId(Id) };
      const result = await RoomsCollection.findOne(query);
      res.send(result);
    });

    app.put("/api/v1/RoomSeat/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const available = body.available;
      const bookedDate = body.bookedDate;
      const option = { upsert: false };
      const value = {
        $set: {
          available: available,

          bookedDate: bookedDate,
        },
      };
      const result = await SeatCollection.updateOne(query, value, option);
      res.send(result);
    });

    app.get("/api/v1/RoomSeat/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await SeatCollection.findOne(query);
      res.send(result);
    });

    app.post("/api/v1/booked", async (req, res) => {
      const body = req.body;
      const result = await Booked.insertOne(body);
      res.send(result);
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // Send a ping to confirm a successful connection
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
