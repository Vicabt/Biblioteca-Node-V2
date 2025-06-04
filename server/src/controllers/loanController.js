const supabase = require('../config/supabase');
const { TABLE_NAME: LOANS_TABLE } = require('../models/Loan');
const { sendSuccess, sendError, sendNotFound, sendValidationError, handleSupabaseError, asyncHandler, validateRequiredFields, HTTP_STATUS } = require('../utils/responseHelper');
const { isValidDate, sanitizeString } = require('../utils/commonValidation');

// Solicitar un préstamo (Usuario)
const requestLoan = asyncHandler(async (req, res) => {
    console.log('Solicitud de préstamo recibida. Body:', req.body);
    const { copy_id, due_date, document_number } = req.body; // Added document_number
    // const user_id = req.user.id; // ID del usuario autenticado - will be fetched based on document_number

    // Validate required fields
    const missingFields = validateRequiredFields(
        { copy_id, due_date, document_number }, 
        ['copy_id', 'due_date', 'document_number']
    );
    if (missingFields.length > 0) {
        console.log('Campos obligatorios faltantes:', missingFields);
        return sendValidationError(res, `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
    }

    // Validate date format
    if (!isValidDate(due_date)) {
        console.log('Formato de fecha de devolución inválido:', due_date);
        return sendValidationError(res, 'Formato de fecha de devolución inválido');
    }

    let user_id;
    // Fetch user_id based on document_number
    const { data: userData, error: userError } = await supabase
        .from('users') // Assuming your users table is named 'users'
        .select('id')
        .eq('document_number', document_number) // Assuming 'document_number' is the column name
        .single();

    if (userError || !userData) {
        console.error('Error fetching user by document number:', userError, 'userData:', userData);
        if (userError && userError.code === 'PGRST116') {
            return sendNotFound(res, 'Usuario no encontrado con el número de documento proporcionado');
        }
        return handleSupabaseError(res, userError, 'Error al buscar el usuario por número de documento');
    }
    user_id = userData.id;

    // Verificar que el ejemplar existe y está disponible
    const { data: copy, error: copyError } = await supabase
        .from('copies')
        .select('id, book_id, state')
        .eq('id', copy_id)
        .single();

    if (copyError || !copy) {
        console.error('Error verificando ejemplar:', copyError, 'copy:', copy);
        if (copyError && copyError.code === 'PGRST116') {
            return sendNotFound(res, 'Ejemplar no encontrado');
        }
        return handleSupabaseError(res, copyError, 'Error al verificar ejemplar');
    }
    
    if (copy.state !== 'disponible') {
        console.log('El ejemplar no está disponible para préstamo. Estado actual:', copy.state);
        return sendValidationError(res, 'El ejemplar no está disponible para préstamo');
    }

    // Crear la solicitud de préstamo
    const { data: loan, error: loanError } = await supabase
        .from(LOANS_TABLE)
        .insert([{ copy_id, book_id: copy.book_id, user_id, due_date, status: 'solicitado' }])
        .select()
        .single();

    if (loanError) {
        console.error('Error al solicitar préstamo:', loanError);
        return handleSupabaseError(res, loanError, 'Error al solicitar el préstamo');
    }

    // Cambiar el estado del ejemplar a 'prestado'
    const { error: updateCopyError } = await supabase
        .from('copies')
        .update({ state: 'prestado' })
        .eq('id', copy_id);
        
    if (updateCopyError) {
        console.error('Error al actualizar estado del ejemplar:', updateCopyError);
        // Opción: revertir el préstamo si falla la actualización del ejemplar
        await supabase.from(LOANS_TABLE).delete().eq('id', loan.id);
        return handleSupabaseError(res, updateCopyError, 'Error al actualizar el estado del ejemplar');
    }

    console.log('Préstamo creado exitosamente:', loan);
    sendSuccess(res, { loan }, HTTP_STATUS.CREATED, 'Solicitud de préstamo creada exitosamente');
});

// Obtener los préstamos de un usuario (Usuario)
const getUserLoans = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    const { data: loans, error } = await supabase
        .from(LOANS_TABLE)
        .select(`
            *,
            book:books (id, title, isbn) 
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) {
        return handleSupabaseError(res, error, 'Error al obtener préstamos del usuario');
    }

    sendSuccess(res, loans, HTTP_STATUS.OK, 'Préstamos obtenidos exitosamente');
});

// Obtener todos los préstamos (Administrador, Bibliotecario)
const getAllLoans = asyncHandler(async (req, res) => {
    const { data: loans, error } = await supabase
        .from(LOANS_TABLE)
        .select(`
            *,
            book:books (id, title, isbn),
            user:users (id, full_name, email, document_number)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return handleSupabaseError(res, error, 'Error al obtener todos los préstamos');
    }

    sendSuccess(res, loans, HTTP_STATUS.OK, 'Préstamos obtenidos exitosamente');
});

// Helper function to update copy state when loan is returned
const updateCopyStateOnReturn = async (copyId) => {
    if (!copyId) return null;
    
    const { error } = await supabase
        .from('copies')
        .update({ state: 'disponible' })
        .eq('id', copyId);
    
    return error;
};

// Consolidated function to update loan (replaces updateLoanStatus, updateLoan, and returnLoan)
const updateLoan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { due_date, loan_date, status } = req.body;

    // Validate that at least one field is being updated
    if (!due_date && !loan_date && !status) {
        return sendValidationError(res, 'Al menos un campo (due_date, loan_date, status) debe ser proporcionado para actualizar');
    }

    // Validate dates if provided
    if (due_date && !isValidDate(due_date)) {
        return sendValidationError(res, 'Formato de fecha de devolución inválido');
    }

    if (loan_date && !isValidDate(loan_date)) {
        return sendValidationError(res, 'Formato de fecha de préstamo inválido');
    }

    // Comprehensive status validation
    const validStatuses = ['solicitado', 'aprobado', 'rechazado', 'devuelto', 'atrasado', 'cancelado'];
    if (status && !validStatuses.includes(status)) {
        return sendValidationError(res, 'Estado no válido proporcionado');
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (due_date) updateData.due_date = due_date;
    if (loan_date) updateData.loan_date = loan_date;
    if (status) {
        updateData.status = status;
        // Automatically set return_date when status becomes 'devuelto'
        if (status === 'devuelto') {
            updateData.return_date = new Date().toISOString();
        }
    }

    const { data: updatedLoan, error } = await supabase
        .from(LOANS_TABLE)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return sendNotFound(res, 'Préstamo no encontrado');
        }
        return handleSupabaseError(res, error, 'Error al actualizar el préstamo');
    }

    // Update copy state if loan was marked as returned
    if (status === 'devuelto' && updatedLoan.copy_id) {
        const copyError = await updateCopyStateOnReturn(updatedLoan.copy_id);
        if (copyError) {
            return sendError(res, 500, 'Préstamo actualizado, pero error al actualizar el estado del ejemplar');
        }
    }

    // Dynamic success message based on operation
    let message = 'Préstamo actualizado exitosamente';
    if (status === 'aprobado') message = 'Préstamo aprobado exitosamente';
    else if (status === 'rechazado') message = 'Préstamo rechazado exitosamente';
    else if (status === 'devuelto') message = 'Préstamo marcado como devuelto exitosamente';

    sendSuccess(res, updatedLoan, HTTP_STATUS.OK, message);
});

const deleteLoan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { error } = await supabase
        .from(LOANS_TABLE)
        .delete()
        .eq('id', id);
        
    if (error) {
        if (error.code === 'PGRST116') {
            return sendNotFound(res, 'Préstamo no encontrado');
        }
        return handleSupabaseError(res, error, 'Error al eliminar el préstamo');
    }
    
    sendSuccess(res, null, HTTP_STATUS.OK, 'Préstamo eliminado correctamente');
});

module.exports = {
    requestLoan,
    getUserLoans,
    getAllLoans,
    updateLoan, // Consolidated function replaces updateLoanStatus, updateLoan, and returnLoan
    deleteLoan
};