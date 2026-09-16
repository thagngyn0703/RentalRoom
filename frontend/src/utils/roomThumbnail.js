// Only transform ordinary versioned, unsigned Cloudinary image URLs.
export const roomThumbnail = (url) => typeof url === 'string'
  ? url.replace(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/)/, '$1f_auto,q_auto,w_640,c_limit/$2')
  : url;
