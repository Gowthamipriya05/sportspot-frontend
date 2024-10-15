const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const csvParser = require('csv-parser'); // Import csv-parser
const { Readable } = require('stream'); // Import stream to convert buffer to readable stream

const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://forusefor12345:d4JxPgwRjLHabcQn@cluster0.tyghd.mongodb.net/sportspot?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas:', err));

// Define Mongoose schemas and models
const studentSchema = new mongoose.Schema({
  s_name: String,
  s_enroll_number: String,
  s_email: { type: String, unique: true },
  s_mobile: String,
  s_password: String,
  s_branch: String,
  s_designation:String
});

const itemSchema = new mongoose.Schema({
  it_name: String,
  it_quantity: Number
});

const itemsIssuedSchema = new mongoose.Schema({
  s_enroll_number: String,
  it_name: String,
  issue_date: Date,
  return_date: Date,
  it_quantity: Number
});

const Student = mongoose.model('Student', studentSchema);
const Item = mongoose.model('Item', itemSchema);
const ItemsIssued = mongoose.model('ItemsIssued', itemsIssuedSchema);

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'forusefor12345@gmail.com',
    pass: 'hwvt zqee jprw rzoe', // Your email password or app password
  },
});

app.post('/register', async (req, res) => {
  const { name, enroll_number, branch, email, password, mobile, designation } = req.body; // Include designation

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  const newStudent = new Student({
    s_name: name,
    s_enroll_number: enroll_number,
    s_email: email,
    s_mobile: mobile,
    s_password: password,
    s_branch: branch,
    s_designation: designation, // Store designation
  });

  try {
    await newStudent.save();

    // Send OTP email
    await transporter.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}.`,
    });

    // Store OTP in memory (for simplicity)
    req.app.locals.otpStore = req.app.locals.otpStore || {};
    req.app.locals.otpStore[email] = otp;

    res.status(200).send({ message: 'Registration successful. Please check your email for the OTP.' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send({ message: 'Registration failed', error: err });
  }
});

// Check if email already exists
app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ s_email: email });
    res.status(200).json({ exists: !!student });
  } catch (err) {
    console.error('Error checking email:', err);
    return res.status(500).send({ message: 'Error checking email' });
  }
});

// Verify OTP API
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (req.app.locals.otpStore && req.app.locals.otpStore[email] === otp) {
    delete req.app.locals.otpStore[email]; // Remove OTP after verification
    res.status(200).send({ message: 'OTP verified successfully!' });
  } else {
    res.status(400).send({ message: 'Invalid OTP' });
  }
});

// API endpoint to fetch issued items with emails
app.get('/items-issued', async (req, res) => {
  try {
    const itemsIssue = await ItemsIssued.find();

    // Fetch emails for each item
    const itemsWithEmails = await Promise.all(
      itemsIssue.map(async (item) => {
        const user = await Student.findOne({ enrollment_number: item.s_enroll_number });
        return {
          ...item.toObject(),
          email: user ? user.s_email : 'N/A', // Set email to 'N/A' if user not found
        };
      })
    );

    res.json(itemsWithEmails);
  } catch (error) {
    console.error('Error fetching items issued:', error);
    res.status(500).json({ message: 'Failed to fetch items issued' });
  }
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ s_email: email });
    if (!student || student.s_password !== password) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    res.status(200).send({ message: 'Login successful', enroll_number: student.s_enroll_number });
  } catch (err) {
    return res.status(500).send({ message: 'Login failed', error: err });
  }
});

// Products API (Fetch all products)
app.get('/products', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send({ message: 'Failed to load products' });
  }
});

// Issue Item API
app.post('/issue-item', async (req, res) => {
  const { s_enroll_number, it_name, issue_date, return_date, it_quantity } = req.body;

  if (!it_name) {
    return res.status(400).send({ message: "'it_name' is required" });
  }

  const newItemIssued = new ItemsIssued({ s_enroll_number, it_name, issue_date, return_date, it_quantity });

  try {
    await newItemIssued.save();
    res.status(200).send({ message: 'Item issued successfully' });
  } catch (err) {
    console.error('Error issuing item:', err);
    res.status(500).send({ message: 'Failed to issue item', error: err });
  }
});
app.put('/update-item/:id', async (req, res) => {
  const { id } = req.params;
  const { it_quantity } = req.body;

  try {
      await Item.updateOne({ _id: id }, { it_quantity });
      res.status(200).send({ message: 'Item quantity updated successfully' });
  } catch (err) {
      console.error('Error updating item quantity:', err);
      res.status(500).send({ message: 'Failed to update item quantity', error: err });
  }
});


// Return Item API
app.put('/return-item/:id', async (req, res) => {
  const { id } = req.params;
  const { return_date } = req.body;

  try {
    await ItemsIssued.updateOne({ _id: id }, { return_date });
    res.status(200).send({ message: 'Item returned successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Failed to return item' });
  }
});

// Reset Password API
app.put('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const result = await Student.updateOne({ s_email: email }, { s_password: newPassword });
    if (result.nModified === 0) {
      return res.status(400).send({ message: 'Email not found' });
    }
    res.status(200).send({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).send({ message: 'Failed to reset password', error: err });
  }
});

// Add this new API to handle CSV uploads and store in MongoDB
/*
app.post('/upload-inventory', async (req, res) => {
  try {
    const inventoryData = req.body; // CSV data parsed by client

    // Validate the incoming data
    if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
      return res.status(400).send({ message: 'Invalid inventory data' });
    }

    // Insert each item in the inventory into the MongoDB collection
    const bulkOperations = inventoryData.map((item) => {
      return {
        updateOne: {
          filter: { it_name: item.name }, // Assuming "name" is the header in CSV
          update: { $set: { it_quantity: item.quantity } },
          upsert: true, // Insert if the item does not exist
        },
      };
    });

    await Item.bulkWrite(bulkOperations);

    res.status(200).send({ message: 'Inventory uploaded successfully' });
  } catch (error) {
    console.error('Error uploading inventory:', error);
    res.status(500).send({ message: 'Failed to upload inventory', error });
  }
});*/

app.post('/upload-inventory', async (req, res) => {
  try {
    const inventoryData = req.body; // CSV data parsed by client
    console.log('Received inventory data:', inventoryData); // Log incoming data

    // Validate the incoming data
    if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
      return res.status(400).json({ message: 'Invalid inventory data' });
    }

    // Create a set of item names from the uploaded data for easy lookup
    const newItems = new Set(inventoryData.map(item => item.name));

    // Fetch existing items from the database
    const existingItems = await Item.find({});
    const existingItemNames = existingItems.map(item => item.it_name);
/*
    // Determine which items need to be deleted
    const itemsToDelete = existingItemNames.filter(itemName => !newItems.has(itemName));

    // Delete items that are no longer in the uploaded CSV
    if (itemsToDelete.length > 0) {
      await Item.deleteMany({ it_name: { $in: itemsToDelete } });
      console.log('Deleted items:', itemsToDelete);
    }*/

    // Prepare bulk operations for updating/inserting new items
    const bulkOperations = inventoryData.map((item) => {
      return {
        updateOne: {
          filter: { it_name: item.Item_Name }, // Assuming "name" is the header in CSV
          update: { $set: { it_quantity: item.Quantity } },
          upsert: true, // Insert if the item does not exist
        },
      };
    });

    // Perform the bulk write operation
    await Item.bulkWrite(bulkOperations);

    res.status(200).json({ message: 'Inventory uploaded successfully' });
  } catch (error) {
    console.error('Error uploading inventory:', error);
    res.status(500).json({ message: 'Failed to upload inventory', error: error.message });
  }
});



// API to get user details by email
app.post('/get-user', async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user in the database by email
    const user = await Student.findOne({ s_email: email }); // Use Student model

    if (user) {
      res.json({
        name: user.s_name, // Use the correct field name
        enrollmentNumber: user.s_enroll_number, // Use the correct field name
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});