import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const BookCoverImage = ({ isbn, title, coverUrlFromDb, altText, className, fetchOnClient = true }) => { // Add fetchOnClient prop with default true
  const [imageUrl, setImageUrl] = useState(coverUrlFromDb || '/images/placeholder-cover.png');
  // Initialize isLoading based on whether a fetch will occur
  const [isLoading, setIsLoading] = useState(!coverUrlFromDb && fetchOnClient); 
  const [error, setError] = useState(null);

  useEffect(() => {
    if (coverUrlFromDb) {
      setImageUrl(coverUrlFromDb);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If no coverUrlFromDb, try to fetch from Google Books API only if fetchOnClient is true
    if (!fetchOnClient) {
      setImageUrl('/images/placeholder-cover.png'); // Set to placeholder if client fetch is disabled
      setIsLoading(false);
      setError(null); // No error, just not fetching
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImageUrl('/images/placeholder-cover.png'); // Reset to placeholder while fetching

    let query = '';
    if (isbn) {
      query = `isbn:${encodeURIComponent(isbn)}`;
    } else if (title) {
      query = `intitle:${encodeURIComponent(title)}`;
    } else {
      setIsLoading(false);
      setError('No ISBN or title provided to fetch cover.');
      setImageUrl('/images/placeholder-cover.png'); // Fallback to placeholder
      return;
    }

    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&fields=items(volumeInfo/imageLinks)`;

    fetch(googleBooksApiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          const imageLinks = data.items[0].volumeInfo.imageLinks;
          if (imageLinks && (imageLinks.thumbnail || imageLinks.smallThumbnail)) {
            setImageUrl(imageLinks.thumbnail || imageLinks.smallThumbnail);
          } else {
            setError('No cover image found in API response.');
            setImageUrl('/images/placeholder-cover.png'); // Fallback to placeholder
          }
        } else {
          setError('No items found in API response for the query.');
          setImageUrl('/images/placeholder-cover.png'); // Fallback to placeholder
        }
      })
      .catch(fetchError => {
        console.error('Error fetching book cover from Google Books API (client-side):', fetchError);
        setError(fetchError.message);
        setImageUrl('/images/placeholder-cover.png'); // Fallback to placeholder
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [isbn, title, coverUrlFromDb, fetchOnClient]);

  const imageAltText = isLoading 
    ? 'Cargando portada...' 
    : (error 
        ? `Error: ${error}` 
        : (imageUrl === '/images/placeholder-cover.png' 
            ? 'Sin portada disponible' 
            : (altText || `Portada de ${title || 'libro'}`)));

  return (
    <img
      src={imageUrl}
      alt={imageAltText}
      className={className || 'w-12 h-auto object-cover'} // Default styling, adjust as needed
      onError={(e) => {
        // Handle broken image links by falling back to placeholder
        if (e.target.src !== '/images/placeholder-cover.png') {
          e.target.src = '/images/placeholder-cover.png';
          e.target.alt = 'Portada no disponible (enlace roto)';
        }
      }}
    />
  );
};

BookCoverImage.propTypes = {
  isbn: PropTypes.string,
  title: PropTypes.string,
  coverUrlFromDb: PropTypes.string,
  altText: PropTypes.string,
  className: PropTypes.string,
  fetchOnClient: PropTypes.bool, // Add prop type for fetchOnClient
};

export default BookCoverImage;
