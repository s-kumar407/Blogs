const mongoose=require("mongoose");

require("dotenv").config();

const uri = `${process.env.MONGODB_URI}`;

console.log(uri);
async function connectToDatabase() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDatabase();

