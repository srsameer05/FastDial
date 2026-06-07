const AWS = require("aws-sdk");
const { v1: uuidv1 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

// Initialize S3 client
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const bucketName = process.env.BUCKET_NAME;

const uploadfile = async (req) => {
  try {
    const filetype = req.file?.mimetype;
    const buffer = req.file?.buffer;

    // Declare fileKey once here
    let fileKey;

    if (req.body.isUpdatingImage) {
      fileKey = await getKeyFromUrl(req.body.oldUrl, bucketName); // Assign to fileKey instead of redeclaring
      await deleteImage(fileKey, bucketName);
      fileKey = uuidv1(); // Update fileKey to a new unique ID
    } else {
      fileKey = uuidv1(); // Assign a new unique ID
    }

    const params = {
      Bucket: bucketName,
      Key: fileKey, // Use fileKey here without error
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
    throw new Error("Error uploading image to S3");
  }
};

// Helper function to extract file key from URL
const getKeyFromUrl = (url, bucketName) => {
  const key = url.split(`${bucketName}/`)[1];
  console.log(key);
  return key;
};

// Function to delete an image from S3
const deleteImage = async (fileKey, bucketName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    await S3.deleteObject(params).promise();
    console.log(`File ${fileKey} deleted successfully`);
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting image from S3");
  }
};

module.exports = uploadfile;
