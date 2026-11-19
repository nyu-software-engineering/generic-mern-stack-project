import express from 'express'
import multer from 'multer'
import { upload, fileUrl, MAX_FILE_SIZE } from '../middleware/upload.js'

const router = express.Router()

// POST /api/uploads
// Send multipart/form-data with the image in a field named "image".
// Responds with the URL to store on the flyer (e.g. flyer.image).
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Please upload a flyer image.' })
    return
  }

  res.status(201).json({
    url: fileUrl(req.file),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  })
})

// Turn Multer and file-type errors into JSON the front-end can show.
// Other routes that use upload.single('image') can reuse this handler.
export function handleUploadErrors(err, req, res, next) {
  if (err.code === 'INVALID_FILE_TYPE') {
    res.status(400).json({ error: err.message })
    return
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    const maxMb = MAX_FILE_SIZE / (1024 * 1024)
    res.status(413).json({ error: `Image must be ${maxMb} MB or smaller.` })
    return
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message })
    return
  }
  next(err)
}

router.use(handleUploadErrors)

export default router
