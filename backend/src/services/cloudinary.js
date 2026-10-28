import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export async function uploadToCloudinary(fileBuffer, options = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
    );
  }

  const folder = options.folder || 'trail-india';
  const resourceType = options.resource_type || 'image';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: options.transformation || [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          created_at: result.created_at,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function uploadBase64OrUrl(dataOrUrl, options = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
    );
  }

  const folder = options.folder || 'trail-india';
  const result = await cloudinary.uploader.upload(dataOrUrl, {
    folder,
    transformation: options.transformation || [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return {
    url: result.secure_url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    created_at: result.created_at,
  };
}

export async function deleteFromCloudinary(publicId) {
  if (!isCloudinaryConfigured) return;
  return await cloudinary.uploader.destroy(publicId);
}

