const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', 
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['applied', 'interviewing', 'hired', 'rejected'],
    default: 'applied'
  }
}, { timestamps: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
