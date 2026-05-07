const express = require('express');
const router = express.Router();

const { handleCreateCourse, handleGetAllCourses, handleGetCourseById, handleUpdateCourse, handleDeleteCourse } = require('../controllers/course');

router.post('/', handleCreateCourse);
router.get('/', handleGetAllCourses);
router.get('/:id', handleGetCourseById);
router.patch('/:id', handleUpdateCourse);
router.delete('/:id', handleDeleteCourse);

module.exports = router;
