const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadSingle,
  uploadArray,
  uploadFields
} = require('../controllers/uploadController');

// 1️⃣ Single file (field name “file”)
//    POST /api/upload/single
router.post('/single', upload.single('file'), uploadSingle);

// 2️⃣ Array of files under one field (“photos”)
//    POST /api/upload/array
//    Up to 5 files
router.post('/array', upload.array('photos', 5), uploadArray);

// 3️⃣ Multiple fields with arrays
//    POST /api/upload/fields
//    Field “avatar” max 1, field “gallery” max 5
router.post(
  '/fields',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]),
  uploadFields
);

module.exports = router;
