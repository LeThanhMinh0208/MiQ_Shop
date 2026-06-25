const SEG = '/upload/';

export const optimizeImg = (url) => {
  if (!url || !url.includes(SEG)) return url;
  return url.replace(SEG, `${SEG}f_auto,q_auto/`);
};
