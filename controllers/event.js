const Event = require('../models/event');
const Registration = require('../models/registration');
const sendEmail = require('../utils/sendMail');

// Helper to check if a valid base64 string
// const isBase64 = (str) => {
//   return typeof str === 'string' && /^data:image\/(png|jpeg|jpg);base64,/.test(str);
// };

function convertFileToBase64(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

async function createEvent(req, res) {
  try {
    const { files } = req;

    // Create a map of uploaded files with their full field names (e.g. speakers[0][photo])
    const fileMap = {};
    for (const file of files) {
      fileMap[file.fieldname] = file;
    }

    // Attach poster if available (e.g. 'poster')
    if (fileMap['poster']) {
      req.body.poster = convertFileToBase64(fileMap['poster']);
    }

    const {
      name,
      description,
      date,
      venue,
      poster,
      organizers = [],
      speakers = [],
      maxCapacity,
      isPaid,
      fee,
    } = req.body;

    // Parse JSON strings if needed
    const parsedOrganizers = typeof organizers === 'string' ? JSON.parse(organizers) : organizers;
    const parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;

    // Basic validation
    if (!name || !description || !date || !venue || !poster || !maxCapacity || (isPaid === true && !fee)) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    // Attach speaker photos
    const finalSpeakers = parsedSpeakers.map((spk, i) => {
      if (!spk.name || !spk.designation || !spk.organizationName) {
        throw new Error('All speaker fields are required.');
      }

      const photoKey = `speakers[${i}][photo]`;
      if (fileMap[photoKey]) {
        spk.photo = convertFileToBase64(fileMap[photoKey]);
      }

      return spk;
    });

    // Attach organizer photos
    const finalOrganizers = parsedOrganizers.map((org, i) => {
      if (!org.name || !org.slogan) {
        throw new Error('All organizer fields are required.');
      }

      const photoKey = `organizers[${i}][photo]`;
      if (fileMap[photoKey]) {
        org.photo = convertFileToBase64(fileMap[photoKey]);
      }

      return org;
    });

    const newEvent = new Event({
      name: name.trim(),
      description: description.trim(),
      date: parsedDate,
      venue: venue.trim(),
      poster: poster.trim(),
      organizers: finalOrganizers,
      speakers: finalSpeakers,
      maxCapacity,
      isPaid,
      fee,
    });

    await newEvent.save();

    res.status(201).json({ success: true, message: 'Event created successfully', data: newEvent });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ message: error?.message || 'Something went wrong while creating the event.' });
  }
}


async function getAllEvents(req, res) {
  try {
    const { limit, type } = req.query;
    const limitNum = limit ? parseInt(limit) : 100;
    let filters = {};

    if (type && type === 'upcoming') {
      const currentDate = new Date();
      filters.date = { $gte: currentDate };
    } else if (type && type === 'past') {
      const currentDate = new Date();
      filters.date = { $lt: currentDate };
    }

    const events = await Event.find(filters).sort({ date: 1 }).limit(limitNum);
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ message: 'Failed to fetch events.' });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    let event = await Event.findById(id)
      .populate({
        path: 'registrations',
        populate: {
          path: 'user',
          model: 'User'
        }
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (req.user === null || req.user.type !== "CABINET-MEMBER") {
      event = event.toObject();
      delete event.registrations; // Hide registrations for non-cabinet members
    }
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get Event Error:', error);
    res.status(500).json({ message: 'Failed to fetch event.' });
  }
}

async function getRegistrationById(req, res) {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id).populate('user').populate('event');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }
    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('Get Registration Error:', error);
    res.status(500).json({ message: 'Failed to fetch registration.' });
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Event not found for deletion.' });
    }
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
      data: deleted,
    });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ message: 'Failed to delete event.' });
  }
}

async function registerForEvent(req, res) {
  try {
    const { id } = req.params; // Event ID
    const userId = req.user._id; // Assuming user ID is available in req.user
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }


    if (event.registrations.length >= event.maxCapacity) {
      return res.status(500).json({
        success: false,
        message: "Registrations are closed"
      })
    }

    if (event.isPaid) {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ success: false, message: 'Transaction ID is required for paid events.' });
      }

      const foundRegistration = await Registration.findOne({ event: id, user: userId });
      if (foundRegistration) {
        return res.status(400).json({ success: false, message: 'User is already registered for this event.' });
      }

      const fileMap = {};
      for (const file of req.files || []) {
        fileMap[file.fieldname] = file;
      }

      const paymentProof = fileMap["paymentProof"];

      if (!paymentProof) {
        return res.status(400).json({
          success: false,
          message: "Payment proof is required for paid events.",
        });
      }
      const createdRegistration = new Registration({
        event: id,
        user: userId,
        transactionId: transactionId,
        status: 'PENDING',
        paymentProof: convertFileToBase64(paymentProof),
      });
      await createdRegistration.save();
      event.registrations.push(createdRegistration._id);
      await event.save();

      return res.status(200).json({ success: true, message: 'Registered for paid event successfully. Registration is pending verification.' });
    } else {
      const foundRegistration = await Registration.findOne({ event: id, user: userId });
      if (foundRegistration) {
        return res.status(400).json({ success: false, message: 'User is already registered for this event.' });
      }
      const createdRegistration = new Registration({
        event: id,
        user: userId,
        status: 'VERIFIED',
      });
      await createdRegistration.save();
      event.registrations.push(createdRegistration._id);
      await event.save();

      return res.status(200).json({ success: true, message: 'Registered for free event successfully.' });
    }

  } catch (error) {
    console.error('Register Event Error:', error);
    res.status(500).json({ success: false, message: 'Failed to register for event.' });
  }
}

async function verifyRegistration(req, res) {
  try {
    const { id } = req.params;
    const { decision } = req.body;
    const registration = await Registration.findById(id).populate('user');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }
    registration.status = decision;
    await registration.save();

    decision === "VERIFIED" ? sendEmail({
      from: 'onboarding@resend.dev',
      to: registration.user.email,
      subject: 'Event Registration Approved',
      html: `<p>Your registration for the event has been approved.</p>`,
    }) : sendEmail({
      from: 'onboarding@resend.dev',
      to: registration.user.email,
      subject: 'Event Registration Rejected',
      html: `<p>Your registration for the event has been rejected.</p>`,
    });
    return res.status(200).json({ success: true, message: 'Registration verified successfully.' });

  } catch (error) {
    console.error('Verify Registration Error:', error);
    res.status(500).json({ message: 'Failed to verify registration.' });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;

    // Fetch the existing event
    let event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { files } = req;

    // Map uploaded files
    const fileMap = {};
    for (const file of files || []) {
      fileMap[file.fieldname] = file;
    }

    // Convert simple fields directly (PATCH)
    const updatableFields = [
      "name",
      "description",
      "date",
      "venue",
      "maxCapacity",
      "isPaid",
      "fee"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = field === "date" ? new Date(req.body[field]) : req.body[field];
      }
    });

    // Update poster if uploaded
    if (fileMap["poster"]) {
      event.poster = convertFileToBase64(fileMap["poster"]);
    }

    // Update organizers array (if provided)
    if (req.body.organizers) {
      let organizers = typeof req.body.organizers === "string"
        ? JSON.parse(req.body.organizers)
        : req.body.organizers;

      organizers = organizers.map((org, i) => {
        const photoKey = `organizers[${i}][photo]`;
        if (fileMap[photoKey]) {
          org.photo = convertFileToBase64(fileMap[photoKey]);
        }
        return org;
      });

      event.organizers = organizers;
    }

    // Update speakers array (if provided)
    if (req.body.speakers) {
      let speakers = typeof req.body.speakers === "string"
        ? JSON.parse(req.body.speakers)
        : req.body.speakers;

      speakers = speakers.map((spk, i) => {
        const photoKey = `speakers[${i}][photo]`;
        if (fileMap[photoKey]) {
          spk.photo = convertFileToBase64(fileMap[photoKey]);
        }
        return spk;
      });

      event.speakers = speakers;
    }

    // Save updated event
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update event.",
    });
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  registerForEvent,
  verifyRegistration,
  getRegistrationById,
};
