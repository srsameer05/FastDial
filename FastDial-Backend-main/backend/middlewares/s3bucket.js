const AWS = require("aws-sdk");
const { v1: uuidv1 } = require("uuid");
const dotenv = require("dotenv");
const fs = require("fs/promises");
const path = require("path");
dotenv.config();

// Initialize S3 client
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const bucketName = process.env.BUCKET_NAME;
const uploadsDir = path.join(__dirname, "..", "uploads");

const hasS3Config = () =>
  Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      bucketName,
  );

const uploadfile = async (req) => {
  try {
    const filetype = req.file?.mimetype;
    const buffer = req.file?.buffer;

    // Declare fileKey once here
    let fileKey;

    if (req.body.isUpdatingImage) {
      fileKey = await getKeyFromUrl(req.body.oldUrl, bucketName);
      await deleteImage(fileKey, bucketName, req.body.oldUrl);
      fileKey = uuidv1();
    } else {
      fileKey = uuidv1();
    }

    if (!hasS3Config()) {
      await fs.mkdir(uploadsDir, { recursive: true });
      const safeExtension = filetype?.split("/")[1] ? `.${filetype.split("/")[1]}` : "";
      const localFileName = `${fileKey}${safeExtension}`;
      const localPath = path.join(uploadsDir, localFileName);
      await fs.writeFile(localPath, buffer);
      return `http://localhost:3000/uploads/${localFileName}`;
    }

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: filetype,
      // ACL: "public-read", // Make the file publicly accessible (optional)
    };

    const data = await S3.upload(params).promise();
    const imageUrl = data.Location; // Get the public URL of the uploaded image
    console.log(imageUrl);
    return imageUrl;
  } catch (error) {
    console.error(error);
    throw new Error("Error uploading image");
  }
};

// Helper function to extract file key from URL
const getKeyFromUrl = (url, bucketName) => {
  const key = url.split(`${bucketName}/`)[1];
  console.log(key);
  return key;
};

// Function to delete an image from S3
const deleteImage = async (fileKey, bucketName, originalUrl) => {
  try {
    if (!hasS3Config()) {
      const localFileName = originalUrl
        ? path.basename(new URL(originalUrl).pathname)
        : path.basename(fileKey);
      const localPath = path.join(uploadsDir, localFileName);
      await fs.unlink(localPath);
      console.log(`File ${localFileName} deleted successfully`);
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    await S3.deleteObject(params).promise();
    console.log(`File ${fileKey} deleted successfully`);
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting image");
  }
};

module.exports = uploadfile;

// gaurav@gmail.com
// 123456