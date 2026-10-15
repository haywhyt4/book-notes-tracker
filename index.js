
import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

import pg from "pg";
import axios from "axios";


const db = new pg.Client(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
        }
);
db.connect()
    .then(() => {
        console.log("Connected to PostgreSQL successfully!");
    })
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));



app.get("/search", async (req, res) => {
    const title = req.query.title;

    if (!title || !title.trim()) {
        return res.redirect("/");
    }

    try {
        const response = await axios.get(
            "https://openlibrary.org/search.json",
            {
                params: {
                    title: title,
                    limit: 5,
                },
            }
        );

        res.render("search.ejs", {
            books: response.data.docs,
        });
    } catch (err) {
        console.error("Error searching for books:", err.message);
        res.status(500).send("Unable to search for books. Please try again.");
    }
});





app.get("/", async (req, res) => {
    const sort = req.query.sort || "newest";

    let orderBy;

    if (sort === "rating") {
        orderBy = "rating DESC NULLS LAST, id DESC";
    } else if (sort === "title") {
        orderBy = "title ASC";
    } else {
        orderBy = "date_read DESC NULLS LAST, id DESC";
    }

    try {
        const result = await db.query(
            `SELECT * FROM books ORDER BY ${orderBy}`
        );

        res.render("index.ejs", {
            books: result.rows,
            sort: sort,
        });
    } catch (err) {
        console.error("Error fetching books:", err.message);
        res.status(500).send("Unable to load books.");
    }
});


app.post("/add", async (req, res) => {
    const { title, author, isbn, rating, notes, date_read } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).send("Book title is required.");
    }

    if (
        rating !== "" &&
        rating !== undefined &&
        (!Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 10)
    ) {
        return res.status(400).send("Rating must be a whole number between 1 and 10.");
    }


    try {
        await db.query(
            `INSERT INTO books (title, author, isbn, rating, notes, date_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                title,
                author || null,
                isbn || null,
                rating ? Number(rating) : null,
                notes || null,
                date_read || null,
            ]
        );

        res.redirect("/");
    } catch (err) {
        console.error("Error adding book:", err.message);
        res.status(500).send("Unable to add book.");
    }
});


app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await db.query(
            "SELECT * FROM books WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Book not found.");
        }

        res.render("edit.ejs", {
            book: result.rows[0],
        });
    } catch (err) {
        console.error("Error fetching book:", err.message);
        res.status(500).send("Unable to load book for editing.");
    }
});


app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const { title, author, isbn, rating, notes, date_read } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).send("Book title is required.");
    }

    if (
        rating !== "" &&
        rating !== undefined &&
        (!Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 10)
    ) {
        return res.status(400).send("Rating must be a whole number between 1 and 10.");
    }


    try {
        await db.query(
            `UPDATE books
       SET title = $1,
           author = $2,
           isbn = $3,
           rating = $4,
           notes = $5,
           date_read = $6
       WHERE id = $7`,
            [
                title,
                author || null,
                isbn || null,
                rating ? Number(rating) : null,
                notes || null,
                date_read || null,
                id,
            ]
        );

        res.redirect("/");
    } catch (err) {
        console.error("Error updating book:", err.message);
        res.status(500).send("Unable to update book.");
    }
});

app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;

    try {
        await db.query(
            "DELETE FROM books WHERE id = $1",
            [id]
        );

        res.redirect("/");
    } catch (err) {
        console.error("Error deleting book:", err.message);
        res.status(500).send("Unable to delete book.");
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
