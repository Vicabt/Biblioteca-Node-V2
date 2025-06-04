const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const supabase = require('../config/supabase');
const { TABLE_NAME: USER_TABLE, hashPassword } = require('../models/User');
const { TABLE_NAME: PUBLISHER_TABLE } = require('../models/Publisher');
const { TABLE_NAME: AUTHOR_TABLE } = require('../models/Author');
const { TABLE_NAME: CATEGORY_TABLE } = require('../models/Category');

// Initial user data
const seedUsers = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Will be hashed before insertion
        role: 'Administrador', // Changed from 'admin'
        active: true,
    },
    {
        username: 'bibliotecario',
        email: 'bibliotecario@example.com',
        password: 'biblio123', // Will be hashed before insertion
        role: 'Bibliotecario',
        active: true,
    },
    {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'usuario123', // Will be hashed before insertion
        role: 'Usuario', // Changed from 'user'
        active: true,
    }
];

// Initial publisher data
const seedPublishers = [
    {
        name: 'Penguin Random House',
        state: 1,
    },
    {
        name: 'HarperCollins',
        state: 1,
    },
    {
        name: 'Simon & Schuster',
        state: 1,
    }
];

// Initial author data
const seedAuthors = [
    {
        name: 'J.K. Rowling',
        state: 1,
    },
    {
        name: 'Stephen King',
        state: 1,
    },
    {
        name: 'Gabriel García Márquez',
        state: 1,
    },
    {
        name: 'George R.R. Martin',
        state: 1,
    }
];

// Initial category data
const seedCategories = [
    {
        name: 'Fiction',
        state: 1,
    },
    {
        name: 'Non-Fiction',
        state: 1,
    },
    {
        name: 'Science Fiction',
        state: 1,
    },
    {
        name: 'Fantasy',
        state: 1,
    },
    {
        name: 'Biography',
        state: 1,
    }
];

// Seed function
const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        // Prepare users with hashed passwords
        const usersToInsert = await Promise.all(
            seedUsers.map(async (user) => ({
                ...user,
                password: await hashPassword(user.password),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }))
        );

        // Prepare publishers with timestamps
        const publishersToInsert = seedPublishers.map(publisher => ({
            ...publisher,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Prepare authors with timestamps
        const authorsToInsert = seedAuthors.map(author => ({
            ...author,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Prepare categories with timestamps
        const categoriesToInsert = seedCategories.map(category => ({
            ...category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // First, delete data from dependent tables (e.g., books)
        console.log('Deleting existing books...');
        const { error: deleteBooksError } = await supabase
            .from('books') // Usar 'books' directamente ya que no hay modelo Book.js
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los registros

        if (deleteBooksError) {
            console.error('Error deleting existing books:', deleteBooksError);
            // Considerar si se debe detener el script aquí o continuar
        } else {
            console.log('Existing books deleted');
        }

        // Delete existing users and insert new ones
        console.log('Seeding users...');
        
        // First check if the users table exists
        const { error: tableError } = await supabase
            .from(USER_TABLE)
            .select('count')
            .limit(1);
            
        // If table doesn't exist, we need to create it
        if (tableError && tableError.code === '42P01') { // PostgreSQL error code for undefined_table
            console.log('Users table does not exist. Please create database schema first.');
            process.exit(1);
        }
        
        // Delete existing users (in a real application, we might want to be more careful here)
        const { error: deleteError } = await supabase
            .from(USER_TABLE)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a non-existent ID (effectively all records)
            
        if (deleteError) {
            console.error('Error deleting existing users:', deleteError);
        } else {
            console.log('Existing users deleted');
        }
        
        // Insert new users
        const { data: createdUsers, error: insertError } = await supabase
            .from(USER_TABLE)
            .insert(usersToInsert)
            .select();
            
        if (insertError) {
            console.error('Error inserting users:', insertError);
        } else {
            console.log(`Created ${createdUsers.length} users:`);
            createdUsers.forEach(user => {
                console.log(`- ${user.username} (${user.email}): ${user.role}`);
            });
        }
        
        // Seed publishers
        console.log('Seeding publishers...');
        
        // Delete existing publishers
        const { error: deletePubError } = await supabase
            .from(PUBLISHER_TABLE)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
            
        if (deletePubError) {
            console.error('Error deleting existing publishers:', deletePubError);
        } else {
            console.log('Existing publishers deleted');
        }
        
        // Insert new publishers
        const { data: createdPublishers, error: insertPubError } = await supabase
            .from(PUBLISHER_TABLE)
            .insert(publishersToInsert)
            .select();
            
        if (insertPubError) {
            console.error('Error inserting publishers:', insertPubError);
        } else {
            console.log(`Created ${createdPublishers.length} publishers:`);
            createdPublishers.forEach(publisher => {
                console.log(`- ${publisher.name}`);
            });
        }

        // Seed authors
        console.log('Seeding authors...');
        
        // Delete existing authors
        const { error: deleteAuthorError } = await supabase
            .from(AUTHOR_TABLE)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
            
        if (deleteAuthorError) {
            console.error('Error deleting existing authors:', deleteAuthorError);
        } else {
            console.log('Existing authors deleted');
        }
        
        // Insert new authors
        const { data: createdAuthors, error: insertAuthorError } = await supabase
            .from(AUTHOR_TABLE)
            .insert(authorsToInsert)
            .select();
            
        if (insertAuthorError) {
            console.error('Error inserting authors:', insertAuthorError);
        } else {
            console.log(`Created ${createdAuthors.length} authors:`);
            createdAuthors.forEach(author => {
                console.log(`- ${author.name}`);
            });
        }
        
        // Seed categories
        console.log('Seeding categories...');
        
        // Delete existing categories
        const { error: deleteCategoryError } = await supabase
            .from(CATEGORY_TABLE)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
            
        if (deleteCategoryError) {
            console.error('Error deleting existing categories:', deleteCategoryError);
        } else {
            console.log('Existing categories deleted');
        }
        
        // Insert new categories
        const { data: createdCategories, error: insertCategoryError } = await supabase
            .from(CATEGORY_TABLE)
            .insert(categoriesToInsert)
            .select();
            
        if (insertCategoryError) {
            console.error('Error inserting categories:', insertCategoryError);
        } else {
            console.log(`Created ${createdCategories.length} categories:`);
            createdCategories.forEach(category => {
                console.log(`- ${category.name}`);
            });
        }

        // Seed books
        console.log('Seeding books...');
        // Obtener IDs de autores, categorías y editoriales
        const authorIds = createdAuthors.map(a => a.id);
        const categoryIds = createdCategories.map(c => c.id);
        const publisherIds = createdPublishers.map(p => p.id);
        // Libros de ejemplo
        const seedBooks = [
            { title: 'El misterio del bosque', isbn: '9781234567001' },
            { title: 'Viaje a las estrellas', isbn: '9781234567002' },
            { title: 'La sombra del pasado', isbn: '9781234567003' },
            { title: 'Caminos de fuego', isbn: '9781234567004' },
            { title: 'El último guardián', isbn: '9781234567005' },
            { title: 'Crónicas del futuro', isbn: '9781234567006' },
            { title: 'El arte de la guerra moderna', isbn: '9781234567007' },
            { title: 'Secretos bajo el mar', isbn: '9781234567008' },
            { title: 'Luz en la tormenta', isbn: '9781234567009' },
            { title: 'El legado perdido', isbn: '9781234567010' }
        ];
        // Asignar relaciones aleatorias y campos requeridos
        const booksToInsert = seedBooks.map((book, i) => ({
            ...book,
            author_id: authorIds[Math.floor(Math.random() * authorIds.length)],
            category_id: categoryIds[Math.floor(Math.random() * categoryIds.length)],
            publisher_id: publisherIds[Math.floor(Math.random() * publisherIds.length)],
            state: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
        const { data: createdBooks, error: insertBooksError } = await supabase
            .from('books')
            .insert(booksToInsert)
            .select();
        if (insertBooksError) {
            console.error('Error inserting books:', insertBooksError);
        } else {
            console.log(`Created ${createdBooks.length} books:`);
            createdBooks.forEach(book => {
                console.log(`- ${book.title} (${book.isbn})`);
            });
        }

        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();
