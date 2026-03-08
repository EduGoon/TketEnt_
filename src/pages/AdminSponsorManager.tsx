import React, { useState, useEffect } from 'react';
import { Sponsor } from '../utilities/types';
import * as adminService from '../services/adminService'


const SponsorManagement: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<Partial<Sponsor>>({
    name: '',
    logoUrl: '',
    website: '',
    tier: 'BRONZE',
    contactEmail: ''
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  // const [loading, setLoading] = useState(false);

    useEffect(() => {
    const load = async () => {
      try {
        // resp is now the Sponsor[] array, not the wrapper object
        const resp = await adminService.listSponsors();
        setSponsors(resp); // REMOVED .data
      } catch (err) {
        console.error('Failed to load sponsors', err);
        setSponsors([]); // Fallback to empty array on error
      }
    };
    load();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        alert('File size cannot exceed 4MB.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setLogoFile(file);
      setLogoPreview(previewUrl);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload: Partial<Sponsor> = { ...formData };

    if (logoFile) {
      const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
      });

      try {
        const logoBase64 = await toBase64(logoFile);
        payload = {
          ...payload,
          logoBase64,
          logoName: logoFile.name,
        };
        // Ensure logoUrl is not sent when uploading a file
        delete payload.logoUrl; 

      } catch (error) {
        console.error('Failed to convert file to Base64', error);
        alert('Error processing image file.');
        return;
      }
    }

    try {
      if (editingSponsor) {
        const updated = await adminService.updateSponsor(editingSponsor.id, payload);
        setSponsors(prev => prev.map(s => (s.id === editingSponsor.id ? updated : s)));
      } else {
        const created = await adminService.createSponsor(payload);
        setSponsors(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save sponsor', err);
      alert('Error saving sponsor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logoUrl: '',
      website: '',
      tier: 'BRONZE',
      contactEmail: ''
    });
    setEditingSponsor(null);
    setShowForm(false);
    setLogoPreview('');
    setLogoFile(null);
  };

  const editSponsor = (sponsor: Sponsor) => {
    setFormData(sponsor);
    setEditingSponsor(sponsor);
    setShowForm(true);
    setLogoPreview(sponsor.logoUrl || '');
    setLogoFile(null);
  };

  const deleteSponsor = async (id: string | number) => {
    try {
      await adminService.deleteSponsor(id.toString());
      setSponsors(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete sponsor', err);
      alert('Error deleting sponsor');
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Sponsor Management</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            disabled={false} // disabled state removed
        >
            {'Add New Sponsor'}
        </button>
      </div>

      {/* Sponsor Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6">{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 object-contain mb-2" />
                ) : (
                  formData.logoUrl && <img src={formData.logoUrl} alt="Current Logo" className="w-32 h-32 object-contain mb-2" />
                )}
                <input
                  type="file"
                  name="logoFile"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or Logo URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!logoFile}
                />
              </div>
            </div>


            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                {editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="w-16 h-8 object-contain mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{sponsor.name}</h3>
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Visit Website
                </a>
              </div>
            </div>
            <div className="mb-4">
                <p className="text-sm text-gray-500">Tier: {sponsor.tier}</p>
              <p className="text-sm text-gray-500">Contact: {sponsor.contactEmail}</p>            </div>
            <div className="flex gap-2">
              <button
                onClick={() => editSponsor(sponsor)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteSponsor(sponsor.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorManagement;