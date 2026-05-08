import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message);
    process.exit(1);
});