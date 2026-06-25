import mongoose from 'mongoose';

const siteAssetSchema = new mongoose.Schema({
  key:            { type: String, required: true, unique: true, index: true },
  name:           { type: String, required: true },
  imageUrl:       { type: String, default: '' },
  imagePublicId:  { type: String, default: '' },
  metadata:       { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('SiteAsset', siteAssetSchema);
