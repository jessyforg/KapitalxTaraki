import axios from 'axios';

// Function to fetch regions
export const fetchRegions = async () => {
  try {
    const response = await axios.get('/data/philippines-regions.json');
    return response.data.regions;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

// Function to fetch provinces by region code
export const fetchProvinces = async (regionCode) => {
  try {
    const response = await axios.get('/data/philippines-regions.json');
    return response.data.provinces[regionCode] || [];
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

// Function to fetch cities by province code
export const fetchCities = async (provinceCode) => {
  try {
    const response = await axios.get('/data/philippines-regions.json');
    return response.data.cities[provinceCode] || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Function to fetch barangays by city code
export const fetchBarangays = async (cityCode) => {
  try {
    const response = await axios.get('/data/philippines-regions.json');
    return response.data.barangays[cityCode] || [];
  } catch (error) {
    console.error('Error fetching barangays:', error);
    return [];
  }
};

// Function to find location by name
export const findLocationByName = async (name) => {
  try {
    const response = await axios.get('/data/philippines-regions.json');
    const data = response.data;
    
    // Search in regions
    const region = data.regions.find(r => r.name.toLowerCase().includes(name.toLowerCase()));
    if (region) return { type: 'region', ...region };

    // Search in provinces
    for (const [regionCode, provinces] of Object.entries(data.provinces)) {
      const province = provinces.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
      if (province) {
        const region = data.regions.find(r => r.code === regionCode);
        return { type: 'province', ...province, region };
      }
    }

    // Search in cities
    for (const [provinceCode, cities] of Object.entries(data.cities)) {
      const city = cities.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      if (city) {
        // Find province and region
        let province, region;
        for (const [regionCode, provinces] of Object.entries(data.provinces)) {
          province = provinces.find(p => p.code === provinceCode);
          if (province) {
            region = data.regions.find(r => r.code === regionCode);
            break;
          }
        }
        return { type: 'city', ...city, province, region };
      }
    }

    // Search in barangays
    for (const [cityCode, barangays] of Object.entries(data.barangays)) {
      const barangay = barangays.find(b => b.name.toLowerCase().includes(name.toLowerCase()));
      if (barangay) {
        // Find city, province and region
        let city, province, region;
        for (const [provinceCode, cities] of Object.entries(data.cities)) {
          city = cities.find(c => c.code === cityCode);
          if (city) {
            for (const [regionCode, provinces] of Object.entries(data.provinces)) {
              province = provinces.find(p => p.code === provinceCode);
              if (province) {
                region = data.regions.find(r => r.code === regionCode);
                break;
              }
            }
            break;
          }
        }
        return { type: 'barangay', ...barangay, city, province, region };
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding location:', error);
    return null;
  }
}; 