const Course = require("../models/courses");

async function handleCreateCourse(req, res) {
    try {
        if (req.files && req.files.length > 0) {
            req.body.picture = `data:${req.files[0].mimetype};base64,${req.files[0].buffer.toString('base64')}`
        }
        const { title, description, tags, status, instructor, startDate, duration, picture } = req.body;
        const createdCourse = new Course({
            title,
            description,
            tags,
            status,
            instructor,
            startDate,
            duration,
            picture
        });
        await createdCourse.save();
        return res.status(201).json({
            success: true,
            message: 'Course created successfully.',
            data: createdCourse,
        });
    } catch (error) {
        console.error('Create Course Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while creating the course.' });
    }
}

async function handleGetAllCourses(req, res) {
    try {
        const foundCourses = await Course.find({}).populate('students', 'name email').populate('instructor', 'name email');
        return res.status(200).json({
            success: true,
            message: 'Courses fetched successfully.',
            data: foundCourses,
        });
    } catch (error) {
        console.error('Get All Courses Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while fetching courses.' });
    }
}

async function handleGetCourseById(req, res) {
    try {
        const { id } = req.params;
        const foundCourse = await Course.findById(id).populate('students', 'name email').populate('instructor', 'name email');
        if (!foundCourse) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        return res.status(200).json({
            success: true,
            message: 'Course fetched successfully.',
            data: foundCourse,
        });
    } catch (error) {
        console.error('Get Course By ID Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while fetching the course.' });
    }
}

async function handleUpdateCourse(req, res) {
    try {
        if (req.files && req.files.length > 0) {
            req.body.picture = `data:${req.files[0].mimetype};base64,${req.files[0].buffer.toString('base64')}`
        }
        const { id } = req.params;
        const { title, description, tags, status, instructor, startDate, duration, picture } = req.body;

        const foundCourse = await Course.findById(id);
        if (!foundCourse) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        if (title) foundCourse.title = title;
        if (description) foundCourse.description = description;
        if (tags) foundCourse.tags = tags;
        if (status) foundCourse.status = status;
        if (instructor) foundCourse.instructor = instructor;
        if (startDate) foundCourse.startDate = startDate;
        if (duration) foundCourse.duration = duration;
        if (picture) foundCourse.picture = picture;

        await foundCourse.save();
        return res.status(200).json({
            success: true,
            message: 'Course updated successfully.',
            data: foundCourse,
        });
    } catch (error) {
        console.error('Update Course Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while updating the course.' });
    }
}

async function handleDeleteCourse(req, res) {
    try {
        const { id } = req.params;
        const foundCourse = await Course.findById(id);
        if (!foundCourse) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        await Course.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: 'Course deleted successfully.',
        });
    } catch (error) {
        console.error('Delete Course Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while deleting the course.' });
    }
}

module.exports = {
    handleCreateCourse,
    handleGetAllCourses,
    handleGetCourseById,
    handleUpdateCourse,
    handleDeleteCourse,
};
