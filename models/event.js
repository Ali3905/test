const mongoose = require('mongoose');

const personSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  designation: {
    type: String,
    required: true,
    trim: true,
  },
  organizationName: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String,
  }
};

const organizationSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slogan: {
    type: String,
  },
  photo: {
    type: String,
  }
}

const eventSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  poster: {
    type: String,
    required: true,
    trim: true,
  },
  organizers: {
    type: [organizationSchema],
    default: [],
  },
  speakers: {
    type: [personSchema],
    default: [],
  },
  registrations: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }],
    default: [],
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  fee: {
    type: Number,
    required: function() { return this.isPaid; },
  },
  maxCapacity: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;