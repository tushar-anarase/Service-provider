const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');
const ServiceRequest = require('./models/ServiceRequest');
const Payment = require('./models/Payment');
const Complaint = require('./models/Complaint');
const Review = require('./models/Review');

async function viewDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n=========================================');
    console.log('       SERVICEPRO DATABASE VIEWER        ');
    console.log('=========================================');
    console.log(`Connected to: ${process.env.MONGODB_URI}\n`);

    const users = await User.find({}, 'name email role isActive isVerified');
    console.log(`📦 USERS COLLECTION (${users.length} records):`);
    console.table(users.map(u => ({
      ID: u._id.toString().slice(-6),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Active: u.isActive,
      Verified: u.isVerified,
    })));

    const services = await Service.find({}, 'name category basePrice priceUnit isActive');
    console.log(`\n🛠️  SERVICES COLLECTION (${services.length} records):`);
    console.table(services.map(s => ({
      ID: s._id.toString().slice(-6),
      Name: s.name,
      Category: s.category,
      BasePrice: `₹${s.basePrice}`,
      Unit: s.priceUnit,
    })));

    const requests = await ServiceRequest.find({}, 'title status urgency totalAmount customer provider');
    console.log(`\n📋 SERVICE REQUESTS (${requests.length} records):`);
    if (requests.length === 0) {
      console.log('   (No service requests created yet)');
    } else {
      console.table(requests.map(r => ({
        ID: r._id.toString().slice(-6),
        Title: r.title,
        Status: r.status,
        Urgency: r.urgency,
        Amount: r.totalAmount ? `₹${r.totalAmount}` : 'TBD',
      })));
    }

    const payments = await Payment.find({});
    console.log(`\n💰 PAYMENTS (${payments.length} records):`);
    if (payments.length === 0) {
      console.log('   (No payments recorded yet)');
    } else {
      console.table(payments.map(p => ({
        ID: p._id.toString().slice(-6),
        Amount: `₹${p.amount}`,
        Method: p.method,
        Status: p.status,
      })));
    }

    console.log('\n=========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
}

viewDatabase();
