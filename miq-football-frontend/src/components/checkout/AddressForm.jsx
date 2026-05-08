const AddressForm = ({ data, onChange }) => {
  const handleChange = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Họ tên *"
          value={data.fullName}
          onChange={handleChange('fullName')}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
        <input
          required
          placeholder="Số điện thoại *"
          value={data.phone}
          onChange={handleChange('phone')}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
      </div>
      <input
        required
        placeholder="Địa chỉ (số nhà, đường) *"
        value={data.street}
        onChange={handleChange('street')}
        className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
      />
      <input
        placeholder="Phường/Xã"
        value={data.ward}
        onChange={handleChange('ward')}
        className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Quận/Huyện *"
          value={data.district}
          onChange={handleChange('district')}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
        <input
          required
          placeholder="Tỉnh/Thành phố *"
          value={data.city}
          onChange={handleChange('city')}
          className="px-4 py-3 rounded-lg border border-cream-200 focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
};

export default AddressForm;