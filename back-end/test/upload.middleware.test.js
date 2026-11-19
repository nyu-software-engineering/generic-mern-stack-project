import { expect } from 'chai'
import { imageFileFilter, makeFilename, fileUrl, ALLOWED_TYPES } from '../middleware/upload.js'
import { handleUploadErrors } from '../routes/uploads.js'

// Builds a fake Express response object that records what the handler sent.
function fakeResponse() {
  const res = {}
  res.status = code => {
    res.statusCode = code
    return res
  }
  res.json = body => {
    res.body = body
    return res
  }
  return res
}

describe('Upload middleware', () => {
  describe('imageFileFilter()', () => {
    it('accepts every allowed image type', () => {
      ALLOWED_TYPES.forEach(mimetype => {
        imageFileFilter({}, { mimetype }, (err, accepted) => {
          expect(err).to.equal(null)
          expect(accepted).to.equal(true)
        })
      })
    })

    it('rejects non-image files with an INVALID_FILE_TYPE error', () => {
      imageFileFilter({}, { mimetype: 'application/pdf' }, err => {
        expect(err).to.be.an('error')
        expect(err.code).to.equal('INVALID_FILE_TYPE')
      })
    })
  })

  describe('makeFilename()', () => {
    it('keeps the original extension in lowercase', () => {
      const name = makeFilename('Club Poster.PNG')
      expect(name).to.match(/^flyer-\d+-\d+\.png$/)
    })

    it('creates a different name each time', () => {
      expect(makeFilename('a.jpg')).to.not.equal(makeFilename('a.jpg'))
    })
  })

  describe('fileUrl()', () => {
    it('points at the static uploads folder', () => {
      expect(fileUrl({ filename: 'flyer-1.png' })).to.equal('/static/uploads/flyer-1.png')
    })
  })

  describe('handleUploadErrors()', () => {
    it('sends 400 for a wrong file type', () => {
      const res = fakeResponse()
      const err = Object.assign(new Error('bad type'), { code: 'INVALID_FILE_TYPE' })
      handleUploadErrors(err, {}, res, () => {})
      expect(res.statusCode).to.equal(400)
      expect(res.body.error).to.equal('bad type')
    })

    it('sends 413 when the file is too large', () => {
      const res = fakeResponse()
      const err = Object.assign(new Error('too big'), { code: 'LIMIT_FILE_SIZE' })
      handleUploadErrors(err, {}, res, () => {})
      expect(res.statusCode).to.equal(413)
      expect(res.body.error).to.include('5 MB')
    })

    it('passes unrelated errors on to Express', () => {
      const err = new Error('something else')
      let passedOn
      handleUploadErrors(err, {}, fakeResponse(), e => {
        passedOn = e
      })
      expect(passedOn).to.equal(err)
    })
  })
})
