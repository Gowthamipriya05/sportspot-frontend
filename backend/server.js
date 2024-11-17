

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const bcrypt = require('bcrypt');

const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

const app = express();
app.use(express.json());
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
  s_designation: String,
  isVerified: { type: Boolean, default: false }, // New attribute
  s_stream:String,
  s_year:String,
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
  it_quantity: Number,
  it_status:Boolean,
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


// // Register endpoint
// app.post('/register', async (req, res) => {
//   const { name, enroll_number, branch, email, password, mobile, designation, stream } = req.body;

//   // Generate OTP
//   const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP

//   const newStudent = new Student({
//     s_name: name,
//     s_enroll_number: enroll_number,
//     s_email: email,
//     s_mobile: mobile,
//     s_password: password,  // Store the hashed password
//     s_branch: branch,
//     s_designation: designation,
//     s_stream: stream,
//   });

//   try {
//     await newStudent.save();

//     // Send OTP email
//     await transporter.sendMail({
//       to: email,
//       subject: 'Your OTP Code',
//       text: `Your OTP code is ${otp}.`,
//     });

//     // Store OTP in memory (for simplicity)
//     req.app.locals.otpStore = req.app.locals.otpStore || {};
//     req.app.locals.otpStore[email] = otp;

//     res.status(200).send({ message: 'Registration successful. Please check your email for the OTP.' });
//   } catch (err) {
//     console.error('Error during registration:', err);
//     res.status(500).send({ message: 'Registration failed', error: err });
//   }
// });


// Register endpoint
app.post('/register', async (req, res) => {
  const { name, enroll_number, branch, email, password, mobile, designation, stream,year } = req.body;

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = new Student({
    s_name: name,
    s_enroll_number: enroll_number,
    s_email: email,
    s_mobile: mobile,
    s_password: hashedPassword,  // Store the hashed password
    s_branch: branch,
    s_designation: designation,
    s_stream: stream,
    isVerified: false,
    s_year:year,
  });

  try {
    await newStudent.save();

    // Send OTP email
    await transporter.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}.`,
    });

    // Store OTP and expiry in memory (for simplicity)
    req.app.locals.otpStore = req.app.locals.otpStore || {};
    req.app.locals.otpStore[email] = { otp, otpExpiry };

    res.status(200).send({ message: 'Registration successful. Please check your email for the OTP.' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send({ message: 'Registration failed', error: err });
  }
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ s_email: email });

    if (!student) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    // Check password with bcrypt
    const passwordMatch = await bcrypt.compare(password, student.s_password);
    if (!passwordMatch) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    if (!student.isVerified) {
      return res.status(403).send({ message: 'Account not verified. Please verify your email.' });
    }

    res.status(200).send({
      message: 'Login successful',
      enroll_number: student.s_enroll_number,
      designation: student.s_designation,
      name: student.s_name,
    });
  } catch (err) {
    return res.status(500).send({ message: 'Login failed', error: err });
  }
});

// Verify OTP API
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const otpData = req.app.locals.otpStore ? req.app.locals.otpStore[email] : null;

  if (otpData && otpData.otp === otp && otpData.otpExpiry > Date.now()) {
    delete req.app.locals.otpStore[email]; // Remove OTP after verification

    // Update isVerified to true
    await Student.updateOne({ s_email: email }, { isVerified: true });

    res.status(200).send({ message: 'OTP verified successfully!' });
  } else {
    res.status(400).send({ message: 'Invalid or expired OTP' });
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



// API endpoint to fetch issued items with emails
app.get('/items-issued', async (req, res) => {
  try {
    const itemsIssue = await ItemsIssued.find();

    // Fetch emails for each item
    const itemsWithEmails = await Promise.all(
      itemsIssue.map(async (item) => {
        const user = await Student.findOne({ s_enroll_number: item.s_enroll_number });
        return {
          ...item.toObject(),
          email: user ? user.s_email : 'N/A',
        };
      })
    );

    res.json(itemsWithEmails);
  } catch (error) {
    console.error('Error fetching items issued:', error);
    res.status(500).json({ message: 'Failed to fetch items issued' });
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

app.post('/issue-item', async (req, res) => {
  const { s_enroll_number, it_name, issue_date, return_date, it_quantity,it_status } = req.body;

  if (!it_name) {
    return res.status(400).send({ message: "'it_name' is required" });
  }

  const newItemIssued = new ItemsIssued({ s_enroll_number, it_name, issue_date, return_date, it_quantity,it_status });

  try {
    await newItemIssued.save();
    res.status(200).send({ message: 'Item issued successfully' });
  } catch (err) {
    console.error('Error issuing item:', err);
    res.status(500).send({ message: 'Failed to issue item', error: err });
  }
});


// Update Item Quantity API
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

// API to handle CSV uploads and store in MongoDB
app.post('/upload-inventory', async (req, res) => {
  try {
    const inventoryData = req.body; // Assuming CSV data is sent in the request body
    console.log('Received inventory data:', inventoryData); // Log incoming data

    // Validate the incoming data
    if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
      return res.status(400).json({ message: 'Invalid inventory data' });
    }

    // Prepare bulk operations for updating/inserting new items
    const bulkOperations = inventoryData.map((item) => {
      return {
        updateOne: {
          filter: { it_name: item.Item_Name }, // Assuming "Item_Name" is the header in CSV
          update: { it_quantity: item.Quantity }, // Assuming "Quantity" is the header in CSV
          upsert: true, // Insert new item if it doesn't exist
        },
      };
    });

    // Perform bulk operations
    await Item.bulkWrite(bulkOperations);
    res.status(200).json({ message: 'Inventory updated successfully' });
  } catch (error) {
    console.error('Error processing inventory upload:', error);
    res.status(500).json({ message: 'Failed to update inventory', error });
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


app.get('/items-issued-by-batch', async (req, res) => {
  try {
    const students = await Student.find().select("s_enroll_number s_year");
    const enrollmentToBatch = {};
    students.forEach(student => {
      enrollmentToBatch[student.s_enroll_number] = student.s_year;
    });

    const items = await ItemsIssued.find();
    const batchCounts = items.reduce((acc, item) => {
      const batch = enrollmentToBatch[item.s_enroll_number];
      if (batch) {
        acc[batch] = (acc[batch] || 0) + 1;
      }
      return acc;
    }, {});

    res.json(batchCounts);
  } catch (error) {
    console.error('Error fetching items issued by batch:', error);
    res.status(500).send({ message: 'Failed to fetch data' });
  }
});


app.get('/items-issued-by-stream', async (req, res) => {
  try {
    const students = await Student.find({ s_stream: "B.Tech" }).select("s_enroll_number");
    const enrollmentNumbers = students.map(student => student.s_enroll_number);
    
    const items = await ItemsIssued.find({ s_enroll_number: { $in: enrollmentNumbers } });
    const itemCounts = items.reduce((acc, item) => {
      acc[item.it_name] = (acc[item.it_name] || 0) + 1;
      return acc;
    }, {});

    res.json(itemCounts);
  } catch (error) {
    console.error('Error fetching items issued by stream:', error);
    res.status(500).send({ message: 'Failed to fetch data' });
  }
});


// Route to retrieve issued items by enrollment number
app.get('/issued-items/:enrollmentNumber', async (req, res) => {
  const { enrollmentNumber } = req.params;

  try {
    const issuedItems = await ItemsIssued.find({ s_enroll_number: enrollmentNumber });
    res.status(200).json(issuedItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving issued items', error });
  }
});

// Return item API
// Endpoint for returning item and updating status
app.put('/return-item/:id', async (req, res) => {
  const { id } = req.params;
  const { return_date, it_status } = req.body;

  try {
    // Update the return_date and set it_status to false
    await ItemsIssued.updateOne({ _id: id }, { return_date, it_status });
    res.status(200).send({ message: 'Return date updated successfully' });
  } catch (err) {
    console.error('Error updating return date:', err);
    res.status(500).send({ message: 'Failed to update return date', error: err });
  }
});

app.put('/update-item-quantity/:it_name', async (req, res) => {
  const name = req.params.it_name.trim(); // Trim whitespace from the received item name
  const { quantity } = req.body;

  // Check if quantity is provided and is a valid number
  if (quantity === undefined || typeof quantity !== 'number') {
    return res.status(400).send({ message: 'Invalid quantity provided' });
  }

  console.log('Received it_name:', name);

  try {
    // Trim whitespace from item names in the database
    const items = await Item.find({});
    const updatePromises = items.map(async (item) => {
      const trimmedName = item.it_name.trim();
      if (trimmedName !== item.it_name) {
        await Item.updateOne({ _id: item._id }, { it_name: trimmedName });
        console.log(`Updated item name: "${item.it_name}" to "${trimmedName}"`);
      }
    });

    await Promise.all(updatePromises); // Wait for all name updates to complete

    // Use regex to match the item name in a case-insensitive way, ignoring trailing spaces
    const item = await Item.findOne({ it_name: new RegExp(`^${name}$`, 'i') });
    console.log('All Items:', (await Item.find({})).map(i => i.it_name.trim())); // Log all items, trimmed, for debugging

    if (!item) {
      return res.status(404).send({ message: `Item with name "${name}" not found` });
    }

    // Calculate the updated quantity
    const updatedQuantity = (item.it_quantity || 0) + quantity;

    // Update the quantity in the database
    await Item.updateOne({ _id: item._id }, { it_quantity: updatedQuantity });

    res.status(200).send({ message: 'Item quantity updated successfully' });
  } catch (err) {
    console.error('Error updating item quantity:', err);
    res.status(500).send({ message: 'Failed to update item quantity', error: err });
  }
});


app.get('/stream-batch', async (req, res) => {
  try {
    const itemsIssue = await ItemsIssued.find();

    // Fetch stream and batch for each issued item
    const combinedCounts = {};
    for (const item of itemsIssue) {
      const user = await Student.findOne({ s_enroll_number: item.s_enroll_number });
      const stream = user ? user.s_stream : 'Unknown';
      const batch = user ? user.s_year : 'Unknown';

      const key = `${stream}-${batch}`;
      if (key in combinedCounts) {
        combinedCounts[key].add(item.s_enroll_number);
      } else {
        combinedCounts[key] = new Set([item.s_enroll_number]);
      }
    }

    // Convert counts to array format
    const response = Object.entries(combinedCounts).map(([key, enrollSet]) => {
      const [stream, batch] = key.split('-');
      return { stream, batch, studentCount: enrollSet.size };
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching stream-batch analysis:', error);
    res.status(500).json({ message: 'Failed to fetch stream-batch analysis' });
  }
});



app.get('/batch-wise', async (req, res) => {
  try {
    // Retrieve all issued items and relevant student data in one go
    const itemsIssue = await ItemsIssued.find();
    const studentEnrollNumbers = itemsIssue.map(item => item.s_enroll_number);

    // Retrieve all student records that match the enrollment numbers from the items issued
    const students = await Student.find({
      s_enroll_number: { $in: studentEnrollNumbers },
    });

    // Create a map for counting unique enrollments by year
    const batchCounts = {};

    for (const student of students) {
      const batch = student.s_year || 'Unknown';

      if (!batchCounts[batch]) {
        batchCounts[batch] = new Set();
      }

      // Add the student's enrollment number to the set for uniqueness
      batchCounts[batch].add(student.s_enroll_number);
    }

    // Convert batchCounts to an array format with student counts
    const response = Object.entries(batchCounts).map(([batch, enrollSet]) => ({
      batch,
      studentCount: enrollSet.size,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching batch-wise analysis:', error);
    res.status(500).json({ message: 'Failed to fetch batch-wise analysis' });
  }
});




app.get('/stream-wise', async (req, res) => {
  try {
    const itemsIssue = await ItemsIssued.find();

    // Fetch stream for each issued item
    const streamCounts = {};
    for (const item of itemsIssue) {
      const user = await Student.findOne({ s_enroll_number: item.s_enroll_number });
      const stream = user ? user.s_stream : 'Unknown';

      if (stream in streamCounts) {
        streamCounts[stream].add(item.s_enroll_number);
      } else {
        streamCounts[stream] = new Set([item.s_enroll_number]);
      }
    }

    // Convert counts to array format
    const response = Object.entries(streamCounts).map(([stream, enrollSet]) => ({
      stream,
      studentCount: enrollSet.size,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching stream-wise analysis:', error);
    res.status(500).json({ message: 'Failed to fetch stream-wise analysis' });
  }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
