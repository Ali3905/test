const application = require("../models/application")

async function handleCreateApplication(req, res) {
    try {
        const { desiredDesignation, about, why } = req.body
        if (!desiredDesignation || !about || !why) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the required fields"
            })
        }

        const createdApplication = await application.create({
            desiredDesignation, about, why
        })

        await user.findByIdAndUpdate(req.data._id, { $set: { application: createdApplication } })

        return res.status(201).json({
            success: true,
            message: "Application Submitted"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleShortListApplication(req, res) {
    try {
        const { applicationId } = req.params
        const { interviewDate } = req.body
        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: "Please provide application ID to shortlist"
            })
        }
        if (!interviewDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields."
            })
        }
        const updatedApplication = await application.findByIdAndUpdate(applicationId, { status: "SHORTLISTED", interviewDate })
        return res.status(200).json({
            success: true,
            message: "Application Shortlisted",
            data: updatedApplication
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleDecideApplication(req, res) {
    try {
        const { decision, applicationId } = req.params
        const { designation } = req.body
        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: "Please provide the application ID to proceed"
            })
        }
        if (!decision) {
            return res.status(400).json({
                success: false,
                message: "Please provide the decision to proceed"
            })
        }

        if (decision === "ACCEPTED") {
            if (!designation) {
                return  res.status(400).json({
                    success: false,
                    message: "Please provide the designation"
                })
            }
            const foundApplication = await application.findById(applicationId)
            foundApplication.status = decision

            await foundApplication.save()

            const updatedUser = await user.findByIdAndUpdate(req.data._id, { type: "CABINET-MEMBER", designation })
            return res.status(200).json({
                success: true,
                message: "Application Accepted",
                data: foundApplication,
            })
        }

        const foundApplication = await application.findById(applicationId)
        foundApplication.status = decision

        await foundApplication.save()

        return res.status(200).json({
            success: true,
            message: "Application Rejected",
            data: foundApplication
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    handleCreateApplication,
    handleDecideApplication
}