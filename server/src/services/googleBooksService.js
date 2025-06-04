const axios = require('axios');
const env = require('../config/env.js');

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Fetches book details from Google Books API using ISBN.
 * @param {string} isbn - The ISBN of the book to search for.
 * @returns {Promise<string|null>} The cover image URL or null if not found or an error occurs.
 */
const getCoverByISBN = async (isbn) => {
  if (!env.googleApiKey) {
    console.warn('Google API Key is not configured. Cannot fetch book covers.');
    return null;
  }

  if (!isbn) {
    return null;
  }

  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: `isbn:${isbn}`,
        key: env.googleApiKey,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      const bookData = response.data.items[0].volumeInfo;
      if (bookData.imageLinks && bookData.imageLinks.thumbnail) {
        return bookData.imageLinks.thumbnail;
      }
      if (bookData.imageLinks && bookData.imageLinks.smallThumbnail) {
        return bookData.imageLinks.smallThumbnail;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching cover from Google Books API:', error.message);
    // Optionally, log more details from error.response if needed
    return null;
  }
};

module.exports = {
  getCoverByISBN,
};
