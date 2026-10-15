# Book Notes Tracker

A web application for tracking books you've read, recording personal notes, rating books, and discovering book information through the Open Library API.

## Features

- Add, view, edit, and delete books.
- Store book details in a PostgreSQL database.
- Record authors, ISBNs, ratings, reading dates, and personal notes.
- Search for books using the Open Library Search API.
- Display book covers when available.
- Sort saved books by reading date, rating, and title.
- Validate book titles and ratings.
- Display responsive pages using EJS templates and CSS.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- EJS
- Axios
- HTML
- CSS
- Open Library API

## Installation

1. Clone this repository.
2. Navigate into the project directory.
3. Install the dependencies:

   `npm install`

4. Create a PostgreSQL database named `book_notes`.
5. Create the `books` table using the SQL schema provided below.
6. Update the database connection settings in `index.js` to match your local PostgreSQL configuration.
7. Start the application:

   `node index.js`

8. Open `http://localhost:3000` in your browser.

## Database Schema

```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    rating INTEGER CHECK (rating BETWEEN 1 AND 10),
    notes TEXT,
    date_read DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Integration

This project uses the Open Library Search API to retrieve book information and the Open Library Covers API to display available book covers.

Search API: https://openlibrary.org/search.json

Covers API: https://covers.openlibrary.org/

## Future Improvements

- Improve responsive design for mobile devices.
- Add pagination for large book collections.
- Add user accounts and authentication.
- Improve search result selection and book-saving workflows.

## Author

Samuel Ayomide Olanrewaju