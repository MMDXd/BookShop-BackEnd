const mongoose = require("mongoose");
const { book } = require("../src/db/schemas/bookSchema");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/bookshop", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    const books = [
      {
        totalSells: 100,
        price: 20,
        offer: 0,
        name: "Book 1",
        imagePath: "/path/to/image1.jpg",
      },
      {
        totalSells: 90,
        price: 25,
        offer: 5,
        name: "Book 2",
        imagePath: "/path/to/image2.jpg",
      },
      {
        totalSells: 80,
        price: 18,
        offer: 0,
        name: "Book 3",
        imagePath: "/path/to/image3.jpg",
      },
      {
        totalSells: 110,
        price: 30,
        offer: 10,
        name: "Book 4",
        imagePath: "/path/to/image4.jpg",
      },
      {
        totalSells: 95,
        price: 22,
        offer: 3,
        name: "Book 5",
        imagePath: "/path/to/image5.jpg",
      },
    ];

    book
      .insertMany(books)
      .then(() => {
        console.log("Sample data inserted successfully");
      })
      .catch((err) => {
        console.error("Error inserting sample data:", err);
      })
      .finally(() => {
        mongoose.disconnect();
      });
      
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
