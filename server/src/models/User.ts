import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { type IBook, bookSchema } from './Book.js';

// Define an interface IUser that extends the Document interface
// This represents the structure of the User document in MongoDB
interface IUser extends Document {
  username: string;           // User's unique username
  email: string;              // User's email (must be unique and match email format)
  password: string;           // User's hashed password
  savedBooks: IBook[];        // Array of books saved by the user (following the IBook schema)
  isCorrectPassword(password: string): Promise<boolean>;  // Method to validate user's password
  bookCount: number;          // Virtual field for counting the number of saved books
}

// Define the userSchema for the User collection
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,         // `username` is required
      unique: true,           // `username` must be unique
    },
    email: {
      type: String,
      required: true,         // `email` is required
      unique: true,           // `email` must be unique
      match: [/.+@.+\..+/, 'Must use a valid email address'],  // Regular expression to ensure valid email format
    },
    password: {
      type: String,
      required: true,         // `password` is required
    },
    // `savedBooks` is an array of books that adhere to the `bookSchema`
    savedBooks: [bookSchema],
  },
  // Enable virtual properties when converting the document to JSON
  {
    toJSON: {
      virtuals: true,  // Allow the virtual fields like `bookCount` to be included in the output
    },
  }
);

// Middleware to hash user password before saving a new user or updating an existing one
userSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it's a new user or the password has been modified
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;  // The number of rounds to use for hashing (higher = more secure but slower)
    // Hash the password using bcrypt
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();  // Continue with the save operation
});

// Custom instance method to compare and validate the password for logging in
userSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
  // Compare the provided password with the hashed password stored in the database
  return await bcrypt.compare(password, this.password);
};

// Virtual field `bookCount` to count the number of books in the `savedBooks` array
// This field will not be saved in the database but can be included when querying the user
userSchema.virtual('bookCount').get(function (this: IUser) {
  return this.savedBooks.length;  // Return the length of the savedBooks array
});

// Create the User model based on the userSchema and IUser interface
const User = model<IUser>('User', userSchema);

export default User;  // Export the User model for use in other parts of the application
