//Sample for Assignment 3
const express = require("express");

//Import a body parser module to be able to access the request body as json
const bodyParser = require("body-parser");

//Use cors to avoid issues with testing on localhost
const cors = require("cors");

const app = express();

const port = 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//Set Cors-related headers to prevent blocking of local requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const genres = [
  { id: 1, name: "Fiction" },
  { id: 2, name: "Non-Fiction" },
  { id: 3, name: "Science Fiction" },
  { id: 4, name: "Fantasy" },
];

const books = [
  { id: 1, title: "Pride and Prejudice", author: "Jane Austin", genreId: 1 },
  {
    id: 2,
    title: "Independent People",
    author: "Halldór Laxnes",
    genreId: 1,
  },
  {
    id: 3,
    title: "Brief Answers to the Big Questions",
    author: "Stephen Hawking",
    genreId: 2,
  },
];

/* YOUR CODE STARTS HERE */

// TODO: Implement all logic from the assignment desription

// Read all books
app.get('/api/v1/books', (req, res) => {
  res.status(200).json(books);
});


//  Get a single book by id
app.get('/api/v1/books/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id === parseInt(id));
  if (book) {
      res.status(200).json(book);
  } else {
      res.status(404).send('Book not found');
  }
});

// Route to create a new book with genreId from URL
app.post('/api/v1/genres/:genreId/books', (req, res) => {
  const { title, author } = req.body;
  const { genreId } = req.params;

  const genreExists = genres.some(genre => genre.id === parseInt(genreId));
  if (!genreExists) {
      return res.status(404).send('Genre not found');
  }
  const newId = books.length > 0 ? Math.max(...books.map(book => book.id)) + 1 : 1;

  const newBook = {
      id: newId,
      title: title,
      author,
      genreId: parseInt(genreId)
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

// Partially update an existing book.

app.patch('/api/v1/genres/:oldGenreId/books/:bookId', (req, res) => {
  const { oldGenreId, bookId } = req.params;
  const { title, author, genreId: newGenreId } = req.body;

  const oldGenreExists = genres.some(genre => genre.id === parseInt(oldGenreId));
  if (!oldGenreExists) {
      return res.status(404).send('Old genre not found');
  }

  const bookIndex = books.findIndex(book => book.id === parseInt(bookId));
  if (bookIndex === -1) {
      return res.status(404).send('Book not found');
  }

  if (newGenreId && !genres.some(genre => genre.id === parseInt(newGenreId))) {
      return res.status(404).send('New genre not found');
  }
  
  if (title) {
      books[bookIndex].title = title;
  }
  if (author) {
      books[bookIndex].author = author;
  }
  if (newGenreId) {
      books[bookIndex].genreId = parseInt(newGenreId);
  }
  res.status(200).json(books[bookIndex]);
});



// Delete books

app.delete('/api/v1/books/:bookId', (req, res) => {
  const { bookId } = req.params;
  const index = books.findIndex(book => book.id === parseInt(bookId));

  if (index === -1) {
      return res.status(404).send('Book not found');
  }

  const [deletedBook] = books.splice(index, 1);


  res.json(deletedBook);
});


// -----
// Genres endpoints
//---

// read all genres

app.get('/api/v1/genres', (req, res) => {
  res.status(200).json(genres);
});


app.post('/api/v1/genres', (req, res) => {
  const { name } = req.body;

  const existingGenre = genres.find(genre => genre.name.toLowerCase() === name.toLowerCase());
  if (existingGenre) {
      return res.status(400).send('Genre with the same name already exists');
  }

  const newId = genres.length > 0 ? Math.max(...genres.map(genre => genre.id)) + 1 : 1;

  const newGenre = {
      id: newId,
      name: name
  };

  genres.push(newGenre);

  res.status(201).json(newGenre);
});


app.delete('/api/v1/genres/:genreId', (req, res) => {
  const { genreId } = req.params;
  const genreIndex = genres.findIndex(genre => genre.id === parseInt(genreId));

  if (genreIndex === -1) {
      return res.status(404).send('Genre not found');
  }
  const booksInGenre = books.some(book => book.genreId === parseInt(genreId));
  if (booksInGenre) {
      return res.status(400).send('Cannot delete genre as it has associated books');
  }

  const [deletedGenre] = genres.splice(genreIndex, 1);

  res.status(200).json(deletedGenre);
});



/* YOUR CODE ENDS HERE */

/* DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) */
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app; // Export the app
