const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { TABLE_NAME } = require('../models/User');

async function createAdminUser() {
    try {
        // Verificar si el usuario ya existe
        const { data: existingUser, error: checkError } = await supabase
            .from(TABLE_NAME)
            .select('email')
            .eq('email', 'admin@example.com')
            .single();

        if (existingUser) {
            console.log('El usuario administrador ya existe');
            process.exit(0);
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Crear el usuario administrador
        const { data: newUser, error: createError } = await supabase
            .from(TABLE_NAME)
            .insert({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'Administrador',
                active: true
            })
            .select()
            .single();

        if (createError) {
            throw new Error(createError.message);
        }

        console.log('Usuario administrador creado exitosamente:', {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

    } catch (error) {
        console.error('Error al crear el usuario administrador:', error.message);
        process.exit(1);
    }
}

createAdminUser(); 