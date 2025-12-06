const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contact = require('./models/Contact');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anjani-caters', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample contacts data
const sampleContacts = [
  {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234 567 8900',
    message: 'I would like to inquire about your catering services for a corporate event.',
    status: 'New',
    priority: 'High'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 234 567 8901',
    message: 'Looking for wedding catering options for 150 guests.',
    status: 'Pending',
    priority: 'High'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@email.com',
    phone: '+1 234 567 8902',
    message: 'Need catering for birthday party, approximately 50 people.',
    status: 'Resolved',
    priority: 'Medium'
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@email.com',
    phone: '+1 234 567 8903',
    message: 'Event planning inquiry for annual company dinner.',
    status: 'New',
    priority: 'Medium'
  },
  {
    name: 'Charlie Wilson',
    email: 'charlie.wilson@email.com',
    phone: '+1 234 567 8904',
    message: 'Looking for menu options for a charity fundraising event.',
    status: 'Pending',
    priority: 'Low'
  },
  {
    name: 'Diana Davis',
    email: 'diana.davis@email.com',
    phone: '+1 234 567 8905',
    message: 'Graduation party catering for 80 guests.',
    status: 'Resolved',
    priority: 'Medium'
  },
  {
    name: 'Edward Miller',
    email: 'edward.miller@email.com',
    phone: '+1 234 567 8906',
    message: 'Family reunion catering needs for 40 people.',
    status: 'New',
    priority: 'Low'
  },
  {
    name: 'Fiona Garcia',
    email: 'fiona.garcia@email.com',
    phone: '+1 234 567 8907',
    message: 'Holiday party catering consultation needed.',
    status: 'Pending',
    priority: 'High'
  },
  {
    name: 'George Rodriguez',
    email: 'george.rodriguez@email.com',
    phone: '+1 234 567 8908',
    message: 'Corporate annual meeting catering for 200 people.',
    status: 'New',
    priority: 'High'
  },
  {
    name: 'Helen Johnson',
    email: 'helen.johnson@email.com',
    phone: '+1 234 567 8909',
    message: 'Anniversary party planning, need quotation.',
    status: 'Resolved',
    priority: 'Medium'
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing contacts
    await Contact.deleteMany({});
    console.log('🗑️ Cleared existing contacts');

    // Insert new contacts
    const insertedContacts = await Contact.insertMany(sampleContacts);
    console.log(`✅ Inserted ${insertedContacts.length} contacts`);

    // Display the contacts
    console.log('\n📋 Seeded contacts:');
    insertedContacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.name} - ${contact.status} (${contact.priority})`);
    });

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } }
        }
      }
    ]);

    const stat = stats[0];
    console.log(`\n📊 Statistics:`);
    console.log(`   Total: ${stat.total}`);
    console.log(`   New: ${stat.new}`);
    console.log(`   Pending: ${stat.pending}`);
    console.log(`   Resolved: ${stat.resolved}`);

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();