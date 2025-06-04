const supabase = require('../config/supabase');
const googleBooksService = require('../services/googleBooksService.js');
const activityService = require('../services/ActivityService');
const { sendSuccess, sendError, sendNotFound, sendValidationError, handleSupabaseError, asyncHandler, validateRequiredFields, HTTP_STATUS } = require('../utils/responseHelper');
const { isValidISBN, sanitizeString, isValidYear } = require('../utils/commonValidation');
const TABLE_NAME = 'books';

const bookController = {
  // Obtener todos los libros
  getAllBooks: asyncHandler(async (req, res) => {
    const { data: books, error } = await supabase
      .from(TABLE_NAME)
      .select(`*,
        author:authors (id, name),
        category:categories (id, name),
        publisher:publishers (id, name)
      `)
      .eq('state', 1)
      .order('title', { ascending: true });
      
    if (error) {
      return handleSupabaseError(res, error, 'Error al obtener libros');
    }
    
    sendSuccess(res, books, HTTP_STATUS.OK, 'Libros obtenidos exitosamente');
  }),

  // Obtener un libro por ID
  getBookById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data: book, error } = await supabase
      .from(TABLE_NAME)
      .select(`*,
        author:authors (id, name),
        category:categories (id, name),
        publisher:publishers (id, name)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return sendNotFound(res, 'Libro no encontrado');
      }
      return handleSupabaseError(res, error, 'Error al obtener libro');
    }
    
    sendSuccess(res, book, HTTP_STATUS.OK, 'Libro obtenido exitosamente');
  }),  // Crear un nuevo libro
  createBook: asyncHandler(async (req, res) => {
    let {
      title,
      isbn,
      publication_year,
      price,
      stock,
      description,
      cover_url, // Keep this from request
      author_id,
      category_id,
      publisher_id,
      state // Assuming state might be part of creation
    } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(
      { title, author_id, category_id, publisher_id }, 
      ['title', 'author_id', 'category_id', 'publisher_id']
    );
    if (missingFields.length > 0) {
      return sendValidationError(res, `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
    }

    // Validate field formats
    if (isbn && !isValidISBN(isbn)) {
      return sendValidationError(res, 'Formato de ISBN inválido');
    }

    if (publication_year && !isValidYear(publication_year)) {
      return sendValidationError(res, 'Año de publicación inválido');
    }

    // If cover_url is not provided or is empty, and isbn is available, try fetching from Google Books
    if ((!cover_url || cover_url.trim() === '') && isbn && isbn.trim() !== '') {
      const googleCoverUrl = await googleBooksService.getCoverByISBN(isbn.trim());
      if (googleCoverUrl) {
        cover_url = googleCoverUrl;
      }
    }

    const { data: book, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        title: sanitizeString(title),
        isbn: isbn ? sanitizeString(isbn) : null,
        publication_year,
        price,
        stock,
        description: description ? sanitizeString(description) : null,
        cover_url, // Use potentially updated cover_url
        author_id,
        category_id,
        publisher_id,
        state: state !== undefined ? state : 1, // Default to active (1) if not provided
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      return handleSupabaseError(res, error, 'Error al crear libro');
    }
    
    // Registrar actividad    await activityService.logCreate('book', book.id, book.title);
    sendSuccess(res, book, HTTP_STATUS.CREATED, 'Libro creado exitosamente');
  }),
  // Actualizar un libro existente
  updateBook: asyncHandler(async (req, res) => {
    const { id } = req.params;
    let {
      title,
      isbn,
      publication_year,
      price,
      stock,
      description,
      cover_url, // Keep this from request
      author_id,
      category_id,
      publisher_id,
      state // Assuming state might be part of update
    } = req.body;

    // Validate field formats if provided
    if (isbn && !isValidISBN(isbn)) {
      return sendValidationError(res, 'Formato de ISBN inválido');
    }

    if (publication_year && !isValidYear(publication_year)) {
      return sendValidationError(res, 'Año de publicación inválido');
    }

    // If cover_url is not provided or is empty, and isbn is available, try fetching from Google Books
    if ((!cover_url || cover_url.trim() === '') && isbn && isbn.trim() !== '') {
      const googleCoverUrl = await googleBooksService.getCoverByISBN(isbn.trim());
      if (googleCoverUrl) {
        cover_url = googleCoverUrl;
      }
    }
    
    const updateData = {
      title: title ? sanitizeString(title) : undefined,
      isbn: isbn ? sanitizeString(isbn) : undefined,
      publication_year,
      price,
      stock,
      description: description ? sanitizeString(description) : undefined,
      cover_url,
      author_id,
      category_id,
      publisher_id,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (state !== undefined) {
      updateData.state = state;
    }

    const { data: book, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return sendNotFound(res, 'Libro no encontrado');
      }
      return handleSupabaseError(res, error, 'Error al actualizar libro');
    }
    
    // Registrar actividad
    await activityService.logUpdate('book', book.id, book.title);
    sendSuccess(res, book, HTTP_STATUS.OK, 'Libro actualizado exitosamente');
  }),
  // Eliminar un libro (ahora desactiva un libro)
  deleteBook: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Obtener el libro para el mensaje de actividad antes de "eliminarlo"
    const { data: bookForActivity, error: getError } = await supabase
      .from(TABLE_NAME)
      .select('title')
      .eq('id', id)
      .single();

    if (getError && getError.code === 'PGRST116') {
      return sendNotFound(res, 'Libro no encontrado');
    }
    
    if (getError) {
      return handleSupabaseError(res, getError, 'Error al obtener información del libro');
    }

    const { data: updatedBook, error } = await supabase
      .from(TABLE_NAME)
      .update({ state: 0, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, title')
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return sendNotFound(res, 'Libro no encontrado para desactivar');
      }
      return handleSupabaseError(res, error, 'Error al desactivar libro');
    }

    // Registrar actividad
    await activityService.logDeactivate('book', id, bookForActivity.title);
    sendSuccess(res, updatedBook, HTTP_STATUS.OK, 'Libro desactivado correctamente');
  }),
  // Cambiar estado de un libro
  toggleBookState: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Obtener el libro actual
    const { data: book, error: getError } = await supabase
      .from(TABLE_NAME)
      .select('state, title')
      .eq('id', id)
      .single();
      
    if (getError) {
      if (getError.code === 'PGRST116') {
        return sendNotFound(res, 'Libro no encontrado');
      }
      return handleSupabaseError(res, getError, 'Error al obtener libro');
    }

    const newState = book.state === 1 ? 0 : 1;

    const { data: updatedBook, error } = await supabase
      .from(TABLE_NAME)
      .update({ state: newState, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      return handleSupabaseError(res, error, 'Error al cambiar estado del libro');
    }

    // Registrar actividad
    await activityService.logStateToggle('book', id, book.title, newState);
    sendSuccess(res, updatedBook, HTTP_STATUS.OK, 'Estado del libro cambiado exitosamente');
  }),

  // Obtener todos los libros inactivos
  getInactiveBooks: asyncHandler(async (req, res) => {
    const { data: books, error } = await supabase
      .from(TABLE_NAME)
      .select(`*,
        author:authors (id, name),
        category:categories (id, name),
        publisher:publishers (id, name)
      `)
      .eq('state', 0)
      .order('title', { ascending: true });
      
    if (error) {
      return handleSupabaseError(res, error, 'Error al obtener libros inactivos');
    }
    
    sendSuccess(res, books, HTTP_STATUS.OK, 'Libros inactivos obtenidos exitosamente');
  })
};

module.exports = bookController;