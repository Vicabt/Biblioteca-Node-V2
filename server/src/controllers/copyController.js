const supabase = require('../config/supabase');
const { TABLE_NAME } = require('../models/Copy');
const { sendSuccess, sendError, sendNotFound, sendValidationError, handleSupabaseError, asyncHandler, validateRequiredFields, HTTP_STATUS } = require('../utils/responseHelper');
const { sanitizeString } = require('../utils/commonValidation');

// Listar ejemplares de un libro
exports.listByBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('book_id', bookId)
    .order('code', { ascending: true });
    
  if (error) {
    return handleSupabaseError(res, error, 'Error al obtener ejemplares');
  }
  
  sendSuccess(res, Array.isArray(data) ? data : [], HTTP_STATUS.OK, 'Ejemplares obtenidos exitosamente');
});

// Obtener un ejemplar por id
exports.getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return sendNotFound(res, 'Ejemplar no encontrado');
    }
    return handleSupabaseError(res, error, 'Error al obtener ejemplar');
  }
  
  sendSuccess(res, data, HTTP_STATUS.OK, 'Ejemplar obtenido exitosamente');
});

// Crear un ejemplar
exports.create = asyncHandler(async (req, res) => {
  const { book_id, code, state, location } = req.body;
  
  // Validate required fields
  const missingFields = validateRequiredFields(
    { book_id, code }, 
    ['book_id', 'code']
  );
  if (missingFields.length > 0) {
    return sendValidationError(res, `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
  }
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ 
      book_id, 
      code: sanitizeString(code), 
      state: state || 'disponible', 
      location: location ? sanitizeString(location) : null 
    }])
    .select()
    .single();
  if (error) {
    return handleSupabaseError(res, error, 'Error al crear ejemplar');
  }
  
  sendSuccess(res, data, HTTP_STATUS.CREATED, 'Ejemplar creado exitosamente');
});

// Actualizar un ejemplar
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, state, location } = req.body;
  
  const updateData = {};
  if (code) updateData.code = sanitizeString(code);
  if (state) updateData.state = state;
  if (location) updateData.location = sanitizeString(location);
  
  if (Object.keys(updateData).length === 0) {
    return sendValidationError(res, 'No se proporcionaron datos para actualizar');
  }
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return sendNotFound(res, 'Ejemplar no encontrado');
    }    return handleSupabaseError(res, error, 'Error al actualizar ejemplar');
  }
  
  sendSuccess(res, data, HTTP_STATUS.OK, 'Ejemplar actualizado exitosamente');
});

// Cambiar solo el estado de un ejemplar
exports.changeState = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { state } = req.body;
  
  if (!state) {
    return sendValidationError(res, 'El estado es requerido');
  }
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ state })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return sendNotFound(res, 'Ejemplar no encontrado');
    }
    return handleSupabaseError(res, error, 'Error al cambiar estado del ejemplar');
  }
  
  sendSuccess(res, data, HTTP_STATUS.OK, 'Estado del ejemplar actualizado exitosamente');
});

// Eliminar un ejemplar
exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
    
  if (error) {
    if (error.code === 'PGRST116') {
      return sendNotFound(res, 'Ejemplar no encontrado');
    }
    return handleSupabaseError(res, error, 'Error al eliminar ejemplar');
  }
  
  sendSuccess(res, null, HTTP_STATUS.OK, 'Ejemplar eliminado correctamente');
});