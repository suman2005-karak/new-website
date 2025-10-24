const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: String, // "09:00"
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  takenAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed', 'skipped'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
