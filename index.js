/*********************************************************************************
*  WEB422 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Juan Pablo Rivera Guerra___ Student ID: _137647228_______ Date: __09-30-2024______________
*  Cyclic Link: ___CLYCLIC IS DOWN__________________________________________
*
********************************************************************************/ 

// Imports
const express = require('express');
const cors = require('cors');
const MoviesDB = require("./modules/moviesDB.js");
const db = new MoviesDB();
const port = process.env.port || 3000;

require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Initialize database
db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(port, ()=>{
        console.log(`server listening on: ${port}`);
    });
}).catch((err)=>{
    console.log(err);
});


// Define a GET route at "/"
app.get('/', (req, res) => {
    res.json({ message: "API Listening" });
});

// POST /api/movies
app.post('/api/movies', async (req, res) => {
    try {
        // Call the addNewMovie method with the request body data
        const newMovie = await db.addNewMovie(req.body);

        // Return the newly created movie with status code 201
        res.status(201).json(newMovie);
    } catch (error) {
        // Return status code 500 and error message on failure
        console.error(error);
        res.status(500).json({ error: 'Failed to add the movie' });
    }
});

// GET /api/movies 
app.get('/api/movies', async (req, res) => {
    try {
        // Retrieve query parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page if not provided
        const title = req.query.title || null; // Get title if provided, else null

        // Call getAllMovies method from db to fetch movies
        const movies = await db.getAllMovies(page, perPage, title);

        const totalMovies = await db.Movie.countDocuments(title ? { title } : {});

        res.json({
            totalMovies,
            totalPages: Math.ceil(totalMovies / perPage), // Calculate total pages
            currentPage: page,
            movies
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve movies' });
    }
});

// GET /api/movies/:id 
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id; // Extract the ID from the route parameter

        const movie = await db.getMovieById(movieId);

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve movie' });
    }
});


// PUT /api/movies/:id
app.put('/api/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id; // Extract the ID from the route parameter
        const updatedData = req.body; // Get the updated data from the request body

        const result = await db.updateMovieById(updatedData, movieId);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Movie not found or no changes made' });
        }

        // Return a success message
        res.json({ message: 'Movie updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update movie' });
    }
});

// DELETE /api/movies/:id
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id; // Extract the ID from the route parameter

        const result = await db.deleteMovieById(movieId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Return a success message
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete movie' });
    }
});







