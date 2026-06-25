import { useState, useEffect, useCallback } from 'react';
import { getCities, getDistricts } from '../../data/vnAddress.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const VN_PHONE_RE = /^0\d{9}$/;

const SELECT_CLS =
  'w-full px-4 py-3 rounded-lg border bg-bg-raised text-text-primary focus:outline-none focus:ring-2 transition appearance-none cursor-pointer border-surface-border focus:border-primary focus:ring-primary/20';
const INPUT_CLS =
  'w-full px-4 py-3 rounded-lg border border-surface-border bg-bg-raised text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const CITIES = getCities();

// Reverse-lookup: find city code from stored name string
const findCityCode = (name) => {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === n)?.code ?? '';
};

const findDistrictCode = (cityCode, name) => {
  if (!cityCode || !name) return '';
  const n = name.trim().toLowerCase();
  return getDistricts(cityCode).find((d) => d.name.toLowerCase() === n)?.code ?? '';
};

const AddressForm = ({ data, onChange, phoneError, onPhoneBlur }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  const handleField = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const validateOnBlur = useCallback((field, value) => {
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [field]: 'Trường này là bắt buộc' }));
    } else {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }, []);

  // Internal codes for hierarchical cascade
  const [cityCode, setCityCode]         = useState(() => findCityCode(data.city));
  const [districtCode, setDistrictCode] = useState(() => findDistrictCode(findCityCode(data.city), data.district));

  // Sync when parent changes data externally (e.g. applying a saved address)
  useEffect(() => {
    const cc = findCityCode(data.city);
    setCityCode(cc);
    setDistrictCode(findDistrictCode(cc, data.district));
  // Only react to city/district name changes, not every keystroke
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.city, data.district]);

  // Legacy address: stored city name doesn't match current dataset → block submission
  const isLegacyCity = data.city !== '' && cityCode === '';

  const districts = getDistricts(cityCode);

  // Ward list fetched from API so full data can be added server-side without a
  // frontend rewrite. Currently returns [] for all districts (no data yet).
  const [wards, setWards] = useState([]);
  useEffect(() => {
    if (!cityCode || !districtCode) { setWards([]); return; }
    fetch(`${API_BASE}/address/wards?province=${cityCode}&district=${districtCode}`)
      .then((r) => r.json())
      .then((body) => setWards(body.data || []))
      .catch(() => setWards([]));
  }, [cityCode, districtCode]);

  const handleCityChange = (e) => {
    const code = e.target.value;
    const name = CITIES.find((c) => c.code === code)?.name ?? '';
    setCityCode(code);
    setDistrictCode('');
    onChange({ ...data, city: name, district: '', ward: '' });
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const name = districts.find((d) => d.code === code)?.name ?? '';
    setDistrictCode(code);
    onChange({ ...data, district: name, ward: '' });
  };

  const handleWardChange = (e) => {
    onChange({ ...data, ward: e.target.value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="addr-fullName" className="sr-only">Họ tên</label>
          <input
            id="addr-fullName"
            required
            placeholder="Họ tên *"
            value={data.fullName}
            onChange={handleField('fullName')}
            onBlur={(e) => validateOnBlur('fullName', e.target.value)}
            autoComplete="name"
            className={`${INPUT_CLS} ${fieldErrors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          {fieldErrors.fullName && (
            <p className="text-red-400 text-xs mt-1" role="alert">{fieldErrors.fullName}</p>
          )}
        </div>
        <div>
          <label htmlFor="addr-phone" className="sr-only">Số điện thoại</label>
          <input
            id="addr-phone"
            required
            placeholder="Số điện thoại *"
            value={data.phone}
            onChange={handleField('phone')}
            onBlur={onPhoneBlur}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`w-full px-4 py-3 rounded-lg border bg-bg-raised text-text-primary focus:outline-none focus:ring-2 transition ${
              phoneError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                : 'border-surface-border focus:border-primary focus:ring-primary/20'
            }`}
          />
          {phoneError && (
            <p className="text-red-400 text-xs mt-1" role="alert">{phoneError}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="addr-street" className="sr-only">Địa chỉ</label>
        <input
          id="addr-street"
          required
          placeholder="Địa chỉ (số nhà, tên đường) *"
          value={data.street}
          onChange={handleField('street')}
          onBlur={(e) => validateOnBlur('street', e.target.value)}
          autoComplete="street-address"
          className={`${INPUT_CLS} ${fieldErrors.street ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        {fieldErrors.street && (
          <p className="text-red-400 text-xs mt-1" role="alert">{fieldErrors.street}</p>
        )}
      </div>

      {/* Legacy address warning — blocks submission via hidden required input */}
      {isLegacyCity && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2.5 text-sm text-amber-400">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>Vui lòng chọn lại địa chỉ giao hàng (địa chỉ cũ không còn khớp với danh sách tỉnh/thành hiện tại).</span>
        </div>
      )}
      {/* Hidden sentinel: required but empty when legacy — browser blocks form submit */}
      {isLegacyCity && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          required
          readOnly
          value=""
          className="sr-only"
          aria-label="legacy-address-sentinel"
        />
      )}

      {/* Hierarchical dropdowns */}
      <select
        required
        value={cityCode}
        onChange={handleCityChange}
        autoComplete="address-level1"
        className={SELECT_CLS}
        aria-label="Tỉnh/Thành phố"
      >
        <option value="">Chọn Tỉnh / Thành phố *</option>
        {CITIES.map((c) => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <select
          required
          value={districtCode}
          onChange={handleDistrictChange}
          disabled={!cityCode}
          autoComplete="address-level2"
          className={`${SELECT_CLS} ${!cityCode ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Quận/Huyện"
        >
          <option value="">{cityCode ? 'Chọn Quận / Huyện *' : 'Chọn Tỉnh/TP trước'}</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </select>

        <select
          value={data.ward || ''}
          onChange={handleWardChange}
          disabled={!districtCode}
          autoComplete="address-level3"
          className={`${SELECT_CLS} ${!districtCode ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Phường/Xã"
        >
          <option value="">{districtCode ? 'Chọn Phường / Xã' : 'Chọn Quận/Huyện trước'}</option>
          {wards.map((w) => (
            <option key={w.code} value={w.name}>{w.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressForm;
