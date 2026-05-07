const Task = require("../models/task");

async function handleCreateTask(req, res) {
    try {
        req.body.picture = `data:${req.files[0].mimetype};base64,${req.files[0].buffer.toString('base64')}`
        const { title, description, dueDate, tags, status, assignedTo, picture } = req.body;
        if (!title || !description || !dueDate || !assignedTo || !picture) {
            return res.status(400).json({ success: false, message: 'Must provide required fields.' });
        }

        const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
        if (assignedToArray.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one user must be assigned to the task.' });
        }

        const task = new Task({
            title,
            description,
            dueDate,
            tags,
            status,
            picture,
            assignedTo: assignedToArray,
        });
        await task.save();
        res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: task,
        });
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ success: false, message: error?.message || 'Something went wrong while creating the task.' });
        
    }
}

async function handleGetAllTasks(req, res) {
    try {
        const tasks = await Task.find({}).populate('assignedTo', 'name email');
        return res.status(200).json({
            success: true,
            message: 'Tasks fetched successfully.',
            data: tasks,
        });
    } catch (error) {
        console.error('Get All Tasks Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while fetching tasks.' });
    }
}

async function handleGetTaskById(req, res) {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate('assignedTo', 'name email');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }
        return res.status(200).json({
            success: true,
            message: 'Task fetched successfully.',
            data: task,
        });
    } catch (error) {
        console.error('Get Task By ID Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while fetching the task.' });
    }
}
async function handleUpdateTask(req, res) {
    try {
        if (req.files && req.files.length > 0) {
            req.body.picture = `data:${req.files[0].mimetype};base64,${req.files[0].buffer.toString('base64')}`
        }
        const { id } = req.params;
        const { title, description, dueDate, tags, status, assignedTo } = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (dueDate) task.dueDate = dueDate;
        if (tags) task.tags = tags;
        if (status) task.status = status;
        if (req.body.picture) task.picture = req.body.picture;
        if (assignedTo) {
            const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
            if (assignedToArray.length === 0) {
                return res.status(400).json({ success: false, message: 'At least one user must be assigned to the task.' });
            }
            task.assignedTo = assignedToArray;
        }
        await task.save();
        return res.status(200).json({
            success: true,
            message: 'Task updated successfully.',
            data: task,
        });
    } catch (error) {
        console.error('Update Task Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while updating the task.' });
    } 
};

async function handleDeleteTask(req, res) {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }
        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully.',
            data: task,
        });
    } catch (error) {
        console.error('Delete Task Error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Something went wrong while deleting the task.' });
    }
}
module.exports = {
    handleCreateTask,
    handleGetAllTasks,
    handleGetTaskById,
    handleUpdateTask,
    handleDeleteTask,
};