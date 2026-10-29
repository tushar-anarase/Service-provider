const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');

const services = [
  { name: 'Electrical Repair', description: 'Fix wiring, sockets, switches, MCBs and electrical faults', icon: '⚡', category: 'Electrical', basePrice: 299, priceUnit: 'per_visit', tags: ['wiring', 'switch', 'socket', 'MCB'], estimatedDuration: '1-3 hours' },
  { name: 'Plumbing', description: 'Repair leaks, pipe fitting, tap installation, drainage issues', icon: '🔧', category: 'Plumbing', basePrice: 249, priceUnit: 'per_visit', tags: ['leak', 'pipe', 'tap', 'drainage'], estimatedDuration: '1-2 hours' },
  { name: 'AC Service & Repair', description: 'AC servicing, gas refilling, installation and repairs', icon: '❄️', category: 'Appliance', basePrice: 399, priceUnit: 'per_visit', tags: ['AC', 'air conditioner', 'cooling', 'gas'], estimatedDuration: '1-4 hours' },
  { name: 'Carpentry', description: 'Furniture repair, door fixing, custom woodwork', icon: '🪚', category: 'Carpentry', basePrice: 349, priceUnit: 'per_visit', tags: ['furniture', 'wood', 'door', 'cabinet'], estimatedDuration: '2-5 hours' },
  { name: 'Home Cleaning', description: 'Deep cleaning, bathroom, kitchen, sofa, carpet cleaning', icon: '🧹', category: 'Cleaning', basePrice: 499, priceUnit: 'per_job', tags: ['cleaning', 'deep clean', 'sofa', 'bathroom'], estimatedDuration: '3-6 hours' },
  { name: 'Vehicle Mechanic', description: 'Car and bike repair, servicing, tyre change and battery', icon: '🔩', category: 'Automotive', basePrice: 399, priceUnit: 'per_visit', tags: ['car', 'bike', 'vehicle', 'tyre', 'battery'], estimatedDuration: '1-4 hours' },
  { name: 'Appliance Repair', description: 'Washing machine, refrigerator, microwave, TV repair', icon: '🔌', category: 'Appliance', basePrice: 299, priceUnit: 'per_visit', tags: ['washing machine', 'refrigerator', 'microwave'], estimatedDuration: '1-3 hours' },
  { name: 'Painting', description: 'Wall painting, waterproofing, texture and exterior painting', icon: '🎨', category: 'Painting', basePrice: 799, priceUnit: 'per_job', tags: ['paint', 'wall', 'exterior', 'waterproof'], estimatedDuration: '1-3 days' },
  { name: 'Pest Control', description: 'Cockroach, termite, mosquito, bed bug treatment', icon: '🪲', category: 'Pest Control', basePrice: 599, priceUnit: 'per_job', tags: ['pest', 'cockroach', 'termite', 'mosquito'], estimatedDuration: '1-2 hours' },
  { name: 'CCTV Installation', description: 'Security camera installation and network setup', icon: '📹', category: 'Security', basePrice: 999, priceUnit: 'per_job', tags: ['CCTV', 'camera', 'security', 'network'], estimatedDuration: '2-5 hours' },
];

const seedData = async (clearFirst = false) => {
  if (clearFirst) {
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');
  }

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(services);
    console.log(`✅ Seeded ${services.length} services`);
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    // Create admin
    await User.create({
      name: 'Admin User',
      email: 'admin@servicepro.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Admin created: admin@servicepro.com / admin123');

    // Create sample customer
    await User.create({
      name: 'Rahul Sharma',
      email: 'customer@test.com',
      phone: '9876543210',
      password: 'test123',
      role: 'customer',
      isVerified: true,
      address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    });
    console.log('✅ Customer created: customer@test.com / test123');

    // Create sample provider
    await User.create({
      name: 'Ramesh Electrician',
      email: 'provider@test.com',
      phone: '9123456780',
      password: 'test123',
      role: 'provider',
      isVerified: true,
      address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
      providerProfile: {
        skills: ['Electrical Repair', 'Appliance Repair'],
        experience: 8,
        bio: 'Experienced electrician with 8 years of expertise in residential and commercial electrical work.',
        serviceAreas: ['Mumbai', 'Thane', 'Navi Mumbai'],
        availabilityStatus: 'available',
        isVerifiedProvider: true,
        rating: 4.8,
        totalReviews: 45,
        completedJobs: 120,
        profileCompleted: true,
      },
    });
    console.log('✅ Provider created: provider@test.com / test123');
  }
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await seedData(true);
    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedData, services };
