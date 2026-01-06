// Quick fix script to restore user name
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/db/connectDB.js';

async function fixUserName() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: 'sasvin@gmail.com' },
            { $set: { name: 'sasvin' } }
        );

        console.log('Updated documents:', result.modifiedCount);

        if (result.modifiedCount > 0) {
            console.log('✅ Name restored to "sasvin" successfully!');
        } else {
            console.log('No user found with that email or name already correct');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixUserName();
