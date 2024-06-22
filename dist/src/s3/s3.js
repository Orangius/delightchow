import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
console.log("Dirname: ", __dirname);
const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "/uploads/"));
    },
    filename: function (req, file, cb) {
        const uniqueFilename = Date.now() + "-" + file.originalname;
        cb(null, uniqueFilename);
    },
});
export const multerUpload = multer({ storage: storageEngine });
export const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET,
    },
    region: process.env.BUCKET_LOCATION,
});
// export async function uploadToS3(request: Request) {
//   const fileStream = fs.createReadStream(request.file?.path as string);
//   const upload = new Upload({
//     client: s3,
//     params: {
//       Bucket: process.env.BUCKET_NAME as string,
//       Key: request.file?.originalname,
//       Body: fileStream,
//       ContentType: request.file?.mimetype,
//     },
//   });
//   return upload.done();
// }
