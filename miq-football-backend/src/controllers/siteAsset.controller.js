import SiteAsset from '../models/SiteAsset.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getSiteAssets = catchAsync(async (req, res) => {
  const { prefix, key } = req.query;

  if (key) {
    const asset = await SiteAsset.findOne({ key }).lean();
    return res.json(new ApiResponse(200, asset || null, 'OK'));
  }

  const query = prefix ? { key: { $regex: `^${prefix}` } } : {};
  const assets = await SiteAsset.find(query).sort('key').lean();
  res.json(new ApiResponse(200, assets, 'OK'));
});

export const upsertSiteAsset = catchAsync(async (req, res) => {
  const { key, name, imageUrl, imagePublicId, metadata } = req.body;
  if (!key) throw new Error('key is required');

  const asset = await SiteAsset.findOneAndUpdate(
    { key },
    { $set: { key, name: name || key, imageUrl: imageUrl || '', imagePublicId: imagePublicId || '', ...(metadata && { metadata }) } },
    { upsert: true, new: true }
  );
  res.json(new ApiResponse(200, asset, 'Updated'));
});

export const deleteSiteAsset = catchAsync(async (req, res) => {
  const { key } = req.body;
  await SiteAsset.findOneAndDelete({ key });
  res.json(new ApiResponse(200, null, 'Deleted'));
});
