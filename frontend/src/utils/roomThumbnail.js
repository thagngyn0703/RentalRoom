// Only transform ordinary versioned, unsigned Cloudinary image URLs.
export const roomThumbnail = (url, width = 640) => typeof url === 'string'
  ? url.replace(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/)/, `$1f_auto,q_auto,w_${width},c_limit/$2`)
  : url;
