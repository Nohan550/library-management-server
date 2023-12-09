const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5500;



app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://library-management-5ee04.web.app'
    ],
    credentials:true
  })
);
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bix9lir.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("libraryDB");
    const category = database.collection("category");
    const categoryBooks = database.collection("Books");
    const borrowedBooks = database.collection("borrowed");


    // auth token
   app.post('/jwt',async(req,res)=>{
    const user =req.body
    console.log(user)
    const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
    res.cookie('token',token,{
      httpOnly:true,
      // secure:true,
      // sameSite:"strict"
      secure:process.eventNames.NODE_ENV === 'production'? true: false,
      sameSite:process.env.NODE_ENV === 'production'?'none' : 'strict',
    }).send(
        {success:true}
        )
   })


     // library

    app.get("/category", async (req, res) => {
      const cursor = category.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/category/books", async (req, res) => {

      const cursor = await categoryBooks.find().toArray();

      res.send(cursor);
    });
    app.post("/category/books", async (req, res) => {
      const Book = req.body;
      const result = await categoryBooks.insertOne(Book);
      res.send(result);
    });
    app.get("/category/books/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      const book = await categoryBooks.findOne(query);
      res.send(book);
    });
    app.patch("/category/books/:name", async (req, res) => {
      const name = req.params.name;
      const book = req.body;

      const filter = { name: name };
    
      const updateBook = {
        $set: {
          name: book.name,
          image: book.image,
          category: book.category,
          author: book.author,
          rating: book.rating,
        },
      };
      const result = await categoryBooks.updateOne(filter, updateBook);
      res.send(result);
    });
    app.get("/category/:category_name", async (req, res) => {
      const category_name = req.params.category_name;
      const query = { category: category_name };
      const cursor = await categoryBooks.find(query).toArray();

      res.send(cursor);
    });
     app.get("/borrowedBooks", async (req, res) => {
      let query ={}
      if(req.query?.email){
        query={email:req.query.email}
      }
      console.log(query)
      const cursor = borrowedBooks.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/borrowedBooks/:book_name", async (req, res) => {
      const name = req.params.book_name;
      const query = { book_name: name };
   
      const cursor = await borrowedBooks.findOne( query);
      res.send(cursor);
    });
    app.post("/borrowedBooks", async (req, res) => {
      const borrowedBook = req.body;
      const result = await borrowedBooks.insertOne(borrowedBook);
      res.send(result);
    });
    app.patch("/category/book/:name", async (req, res) => {
      const name = req.params.name;
      const book = req.body;
      const filter = { name: name };
      const options = { upsert: true };
      const updateBook = {
        $set: {
               quantity:book.quantity
        },
      };
      const result = await categoryBooks.updateOne(filter, updateBook, options);
      res.send(result);
    });
    app.delete("/borrowedBooks/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await borrowedBooks.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successful ping and connection");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Examiner");
});

app.listen(port, () => {
  console.log(`Assalamu Alaikum From ${port}`);
});
