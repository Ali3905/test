// const fs = require('fs');
// const path = require('path');

// function convertFilesToBase64(req) {
//     const files = req.file ? { [req.file.fieldname]: [req.file] } : req.files;

//     if (!files) return;
//     files.forEach((file) => {
//         if (!file) return;
//         console.log("running here in top: ", file);
//         // const file = fileArray[0];
//         const filePath = file.buffer ? file.buffer : path.join(__dirname, '..', 'uploads', file.filename);

//         // if (fs.existsSync(filePath)) {
//             const base64 = fs.readFileSync(filePath, { encoding: 'base64' });
//             req.body[field.fieldname] = `data:${file.mimetype};base64,${base64}`;
//             fs.unlinkSync(filePath); // Delete file after storing in base64
//         // }
//         // else {
//         //     console.error(`File not found: ${filePath}`);
//         // }
//     });
// }

// module.exports = convertFilesToBase64;
