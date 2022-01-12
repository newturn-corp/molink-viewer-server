import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'
import aws from 'aws-sdk'

const s3 = new aws.S3()

export default (bucket: string) => multer({
    storage: multerS3({
        s3,
        bucket,
        key: function (req, file, cb) {
            const extension = path.extname(file.originalname)
            cb(null, Date.now().toString() + extension)
        }
    })
})
