const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },

  // Provider-specific fields
  providerProfile: {
    skills: [{ type: String }],
    experience: { type: Number, default: 0 }, // years
    bio: { type: String, default: '' },
    serviceAreas: [{ type: String }],
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    isVerifiedProvider: { type: Boolean, default: false },
    documents: [{ type: String }], // document file paths
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '20:00' },
    },
    idProof: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
  },

  // Customer-specific fields
  customerProfile: {
    totalRequests: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
  },

  notifications: { type: Boolean, default: true },
  fcmToken: { type: String, default: '' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
