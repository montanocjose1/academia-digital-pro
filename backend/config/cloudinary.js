import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage configured.');
} else {
  console.log('Cloudinary variables missing. Using local filesystem storage fallback.');
}

/**
 * Uploads a file buffer or path to Cloudinary or saves it locally.
 * @param {Object} file - Multer file object
 * @param {string} folder - Folder name in Cloudinary (e.g. 'thumbnails', 'videos')
 * @returns {Promise<string>} - The URL of the uploaded resource
 */
export const uploadFile = async (file, folder = 'general') => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `academia_digital_pro/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Local fallback
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadsDir, fileName);
      
      fs.writeFileSync(filePath, file.buffer);
      
      // Return a relative URL that the frontend can call (e.g. /uploads/filename)
      return `/uploads/${fileName}`;
    } catch (err) {
      console.error('Local file write error:', err);
      throw err;
    }
  }
};

export default cloudinary;
