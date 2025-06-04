const supabase = require('../config/supabase');
const { sendSuccess, handleSupabaseError, asyncHandler, HTTP_STATUS } = require('../utils/responseHelper');

const getRecentActivities = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    return handleSupabaseError(res, error, 'Error al obtener actividades recientes');
  }
  
  sendSuccess(res, data, HTTP_STATUS.OK, 'Actividades recientes obtenidas exitosamente');
});

module.exports = { getRecentActivities };