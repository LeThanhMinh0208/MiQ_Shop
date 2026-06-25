import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, Loader, Check, X, Trophy, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSiteAssets, upsertSiteAsset } from '../../services/siteAssetService.js';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

const CLUB_SLOTS = [
  { key: 'club/man-utd',    name: 'Man United',    country: 'ENG', defaultColor: '#DA291C' },
  { key: 'club/real-madrid',name: 'Real Madrid',   country: 'ESP', defaultColor: '#FEBE10' },
  { key: 'club/barcelona',  name: 'Barcelona',     country: 'ESP', defaultColor: '#A50044' },
  { key: 'club/man-city',   name: 'Man City',      country: 'ENG', defaultColor: '#6CABDD' },
  { key: 'club/arsenal',    name: 'Arsenal',       country: 'ENG', defaultColor: '#EF0107' },
  { key: 'club/liverpool',  name: 'Liverpool',     country: 'ENG', defaultColor: '#C8102E' },
  { key: 'club/bayern',     name: 'Bayern Munich', country: 'GER', defaultColor: '#DC052D' },
  { key: 'club/psg',        name: 'PSG',           country: 'FRA', defaultColor: '#003090' },
  { key: 'club/chelsea',    name: 'Chelsea',       country: 'ENG', defaultColor: '#034694' },
  { key: 'club/juventus',   name: 'Juventus',      country: 'ITA', defaultColor: '#000000' },
  { key: 'club/inter',      name: 'Inter Milan',   country: 'ITA', defaultColor: '#010E80' },
  { key: 'club/atletico',   name: 'Atlético',      country: 'ESP', defaultColor: '#CB3524' },
  { key: 'club/vietnam',    name: 'Việt Nam',      country: 'VIE', defaultColor: '#DA251D' },
  { key: 'club/brazil',     name: 'Brazil',        country: 'BRA', defaultColor: '#009C3B' },
  { key: 'club/argentina',  name: 'Argentina',     country: 'ARG', defaultColor: '#74ACDF' },
];

const COLLECTION_SLOTS = [
  { key: 'collection/banner/1', name: 'Banner BST 1' },
  { key: 'collection/banner/2', name: 'Banner BST 2' },
  { key: 'collection/banner/3', name: 'Banner BST 3' },
  { key: 'collection/banner/4', name: 'Banner BST 4' },
  { key: 'shop-by-club/banner', name: 'Mua Theo CLB — Banner' },
];

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'miq-site-assets');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Upload ảnh thất bại');
  return res.json();
};

const AssetSlot = ({ slot, existingUrl, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const cloudData = await uploadToCloudinary(file);
      await upsertSiteAsset({
        key: slot.key,
        name: slot.name,
        imageUrl: cloudData.secure_url,
        imagePublicId: cloudData.public_id,
      });
      toast.success(`Cập nhật ${slot.name} thành công!`);
      onUploaded();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tải ảnh');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const imgSrc = preview || existingUrl;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-bg-elevated rounded-2xl border border-surface-border overflow-hidden group"
    >
      {/* Image area */}
      <div
        className="relative bg-surface aspect-square cursor-pointer"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={slot.name} className="w-full h-full object-contain p-3" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
            <Image className="w-8 h-8 opacity-30" />
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          {uploading ? (
            <Loader className="w-6 h-6 text-white animate-spin" />
          ) : (
            <div className="text-center text-white">
              <Upload className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-semibold">Đổi ảnh</span>
            </div>
          )}
        </div>
        {existingUrl && !uploading && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm text-text-primary truncate">{slot.name}</p>
        <p className="text-xs text-text-muted mt-0.5 truncate">{slot.key}</p>
      </div>
    </motion.div>
  );
};

const SiteAssetsManagement = () => {
  const [tab, setTab] = useState('clubs');
  const qc = useQueryClient();

  const { data: clubAssets = [] } = useQuery({
    queryKey: ['site-assets', 'club'],
    queryFn: () => getSiteAssets('club'),
  });

  const { data: collectionAssets = [] } = useQuery({
    queryKey: ['site-assets', 'collection'],
    queryFn: () => getSiteAssets('collection'),
  });

  const assetMap = [...clubAssets, ...collectionAssets].reduce((acc, a) => {
    acc[a.key] = a.imageUrl;
    return acc;
  }, {});

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['site-assets'] });
  };

  const slots = tab === 'clubs' ? CLUB_SLOTS : COLLECTION_SLOTS;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Image className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">QUẢN LÝ HÌNH ẢNH</h1>
          <p className="text-sm text-text-muted">Thay đổi ảnh CLB và banner bộ sưu tập</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('clubs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'clubs' ? 'bg-primary text-white' : 'bg-bg-elevated border border-surface-border text-text-primary hover:border-primary/40'
          }`}
        >
          <Trophy className="w-4 h-4" /> Logo CLB
        </button>
        <button
          onClick={() => setTab('collections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'collections' ? 'bg-primary text-white' : 'bg-bg-elevated border border-surface-border text-text-primary hover:border-primary/40'
          }`}
        >
          <Image className="w-4 h-4" /> Bộ sưu tập & Banner
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm text-text-muted">
        Click vào ảnh để tải ảnh mới lên. Ảnh sẽ được lưu lên Cloudinary và hiển thị ngay trên website.
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${tab === 'clubs' ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {slots.map((slot) => (
          <AssetSlot
            key={slot.key}
            slot={slot}
            existingUrl={assetMap[slot.key] || ''}
            onUploaded={refresh}
          />
        ))}
      </div>
    </div>
  );
};

export default SiteAssetsManagement;
