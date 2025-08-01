const cloudinary = require('cloudinary').v2;
// Tell Cloudinary your account details from .env
cloudinary.config({
  cloud_name: process.env.drv9axos6,
  api_key: process.env.982673431862412,
  api_secret: process.env.4HyOTI-fPsvGqLq2UJaMnJnka6U
});

// 1. Single file upload
exports.uploadSingle = (req, res) => {
  cloudinary.uploader.upload_stream(
    { resource_type: 'auto' },
    (error, result) => {
      if (error) return res.status(500).json(error);
      res.json(result);
    }
  ).end(req.file.buffer);
};

// 2. Multiple files in one field
exports.uploadArray = async (req, res) => {
  const files = req.files;
  const promises = files.map(file =>
    new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(file.buffer);
    })
  );
  const results = await Promise.all(promises);
  res.json(results);
};

// 3. Multiple fields, each with arrays
exports.uploadFields = async (req, res) => {
  const allUploads = [];
  // req.files is an object mapping field names to arrays
  for (let field in req.files) {
    req.files[field].forEach(file => {
      allUploads.push(
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: field },
            (error, result) => error ? reject(error) : resolve({ field, ...result })
          ).end(file.buffer);
        })
      );
    });
  }
  const results = await Promise.all(allUploads);
  res.json(results);
};
