require('dotenv').config();

console.log('Variables de entorno:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Definida' : 'No definida');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Definida' : 'No definida');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definida' : 'No definida');
console.log('PORT:', process.env.PORT || 'No definida (usando valor por defecto)'); 