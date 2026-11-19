import fs from 'fs'
import path from 'path'
import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'
import { UPLOAD_DIR, MAX_FILE_SIZE } from '../middleware/upload.js'

use(chaiHttp)

// A real 1x1 PNG, so we don't need image files checked into the repo.
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

describe('POST /api/uploads', () => {
  const savedFiles = []

  // Delete anything the tests uploaded so public/uploads stays clean.
  after(() => {
    savedFiles.forEach(name => fs.rmSync(path.join(UPLOAD_DIR, name), { force: true }))
  })

  it('saves an image and returns its URL', async () => {
    const res = await request
      .execute(app)
      .post('/api/uploads')
      .attach('image', tinyPng, { filename: 'flyer.png', contentType: 'image/png' })

    expect(res).to.have.status(201)
    expect(res.body).to.include({ originalName: 'flyer.png', mimetype: 'image/png' })
    expect(res.body.url).to.equal(`/static/uploads/${res.body.filename}`)
    expect(fs.existsSync(path.join(UPLOAD_DIR, res.body.filename))).to.equal(true)
    savedFiles.push(res.body.filename)
  })

  it('serves the uploaded image from its URL', async () => {
    const upload = await request
      .execute(app)
      .post('/api/uploads')
      .attach('image', tinyPng, { filename: 'flyer.png', contentType: 'image/png' })
    savedFiles.push(upload.body.filename)

    const res = await request.execute(app).get(upload.body.url)
    expect(res).to.have.status(200)
    expect(res).to.have.header('content-type', 'image/png')
  })

  it('returns 400 when no image is sent', async () => {
    const res = await request.execute(app).post('/api/uploads')
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Please upload a flyer image.')
  })

  it('returns 400 for a file that is not an image', async () => {
    const res = await request
      .execute(app)
      .post('/api/uploads')
      .attach('image', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' })

    expect(res).to.have.status(400)
    expect(res.body.error).to.include('Only JPEG, PNG, GIF, or WebP')
  })

  it('returns 400 when the image is sent under the wrong field name', async () => {
    const res = await request
      .execute(app)
      .post('/api/uploads')
      .attach('photo', tinyPng, { filename: 'flyer.png', contentType: 'image/png' })

    expect(res).to.have.status(400)
  })

  it('returns 413 for an image over the size limit', async () => {
    const tooBig = Buffer.alloc(MAX_FILE_SIZE + 1)
    const res = await request
      .execute(app)
      .post('/api/uploads')
      .attach('image', tooBig, { filename: 'huge.png', contentType: 'image/png' })

    expect(res).to.have.status(413)
    expect(res.body.error).to.include('5 MB')
  })
})
