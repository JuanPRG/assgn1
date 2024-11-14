const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  plot: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  num_mflix_comments: Number,
  poster: String,
  title: String,
  fullplot: String,
  languages: [String],
  released: Date,
  directors: [String],
  rated: String,
  awards: {
    wins: Number,
    nominations: Number,
    text: String
  },
  lastupdated: Date,
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  },
  countries: [String],
  type: String,
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    dvd: Date,
    lastUpdated: Date
  }
}
);

module.exports = class MoviesDB {
  constructor() {
    // We don't have a `Movie` object until initialize() is complete
    this.Movie = null;
  }

  // Pass the connection string to `initialize()`
  initialize(connectionString) {
    return new Promise((resolve, reject) => {
      const db = mongoose.createConnection(
        connectionString,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );

      db.once('error', (err) => {
        reject(err);
      });
      db.once('open', () => {
        this.Movie = db.model("movies", movieSchema);
        resolve();
      });
    });
  }

  async addNewMovie(data) {
    const newMovie = new this.Movie(data);
    await newMovie.save();
    return newMovie;
  }

 getAllMovies(page, perPage, title) {

    // Use case-insensitive search for title if provided
    let findBy = title ? { title: { $regex: new RegExp(title, 'i') } } : {};

    // Validate page and perPage to be valid positive integers
    if (!Number.isInteger(+page) || !Number.isInteger(+perPage) || +page <= 0 || +perPage <= 0) {
        return Promise.reject(new Error('page and perPage query parameters must be valid positive integers'));
    }

    // Perform the query with pagination and sorting by year (ascending)
    return this.Movie.find(findBy)
        .sort({ year: 1 }) // Ascending order
        .skip((page - 1) * +perPage) // Skip the correct number of documents based on page and perPage
        .limit(+perPage) // Limit the number of documents per page
        .exec();
}


  getMovieById(id) {
    return this.Movie.findOne({ _id: id }).exec();
  }

  updateMovieById(data, id) {
    return this.Movie.updateOne({ _id: id }, { $set: data }).exec();
  }

  deleteMovieById(id) {
    return this.Movie.deleteOne({ _id: id }).exec();
  }
}
