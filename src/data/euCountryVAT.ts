export interface EUCountryVAT {
  country: string;
  countryCode: string;
  vatRate: number;
  currency: string;
  notes?: string;
}

export const EU_COUNTRIES_VAT: EUCountryVAT[] = [
  {
    country: "Austria",
    countryCode: "AT",
    vatRate: 20,
    currency: "EUR"
  },
  {
    country: "Belgium",
    countryCode: "BE",
    vatRate: 21,
    currency: "EUR"
  },
  {
    country: "Bulgaria",
    countryCode: "BG",
    vatRate: 20,
    currency: "BGN"
  },
  {
    country: "Croatia",
    countryCode: "HR",
    vatRate: 25,
    currency: "EUR"
  },
  {
    country: "Cyprus",
    countryCode: "CY",
    vatRate: 19,
    currency: "EUR"
  },
  {
    country: "Czech Republic",
    countryCode: "CZ",
    vatRate: 21,
    currency: "CZK"
  },
  {
    country: "Denmark",
    countryCode: "DK",
    vatRate: 25,
    currency: "DKK"
  },
  {
    country: "Estonia",
    countryCode: "EE",
    vatRate: 22,
    currency: "EUR",
    notes: "Rising to 24%"
  },
  {
    country: "Finland",
    countryCode: "FI",
    vatRate: 25.5,
    currency: "EUR"
  },
  {
    country: "France",
    countryCode: "FR",
    vatRate: 20,
    currency: "EUR"
  },
  {
    country: "Germany",
    countryCode: "DE",
    vatRate: 19,
    currency: "EUR"
  },
  {
    country: "Greece",
    countryCode: "GR",
    vatRate: 24,
    currency: "EUR"
  },
  {
    country: "Hungary",
    countryCode: "HU",
    vatRate: 27,
    currency: "HUF",
    notes: "Highest in EU"
  },
  {
    country: "Ireland",
    countryCode: "IE",
    vatRate: 23,
    currency: "EUR"
  },
  {
    country: "Italy",
    countryCode: "IT",
    vatRate: 22,
    currency: "EUR"
  },
  {
    country: "Latvia",
    countryCode: "LV",
    vatRate: 21,
    currency: "EUR"
  },
  {
    country: "Lithuania",
    countryCode: "LT",
    vatRate: 21,
    currency: "EUR"
  },
  {
    country: "Luxembourg",
    countryCode: "LU",
    vatRate: 17,
    currency: "EUR",
    notes: "Lowest in EU"
  },
  {
    country: "Malta",
    countryCode: "MT",
    vatRate: 18,
    currency: "EUR"
  },
  {
    country: "Netherlands",
    countryCode: "NL",
    vatRate: 21,
    currency: "EUR"
  },
  {
    country: "Poland",
    countryCode: "PL",
    vatRate: 23,
    currency: "PLN"
  },
  {
    country: "Portugal",
    countryCode: "PT",
    vatRate: 23,
    currency: "EUR"
  },
  {
    country: "Romania",
    countryCode: "RO",
    vatRate: 19,
    currency: "RON"
  },
  {
    country: "Slovakia",
    countryCode: "SK",
    vatRate: 20,
    currency: "EUR"
  },
  {
    country: "Slovenia",
    countryCode: "SI",
    vatRate: 22,
    currency: "EUR"
  },
  {
    country: "Spain",
    countryCode: "ES",
    vatRate: 21,
    currency: "EUR"
  },
  {
    country: "Sweden",
    countryCode: "SE",
    vatRate: 25,
    currency: "SEK"
  }
];

// Helper functions
export const getVATRateByCountry = (countryName: string): number | null => {
  const country = EU_COUNTRIES_VAT.find(
    c => c.country.toLowerCase() === countryName.toLowerCase()
  );
  return country ? country.vatRate : null;
};

export const getVATRateByCountryCode = (countryCode: string): number | null => {
  const country = EU_COUNTRIES_VAT.find(
    c => c.countryCode.toLowerCase() === countryCode.toLowerCase()
  );
  return country ? country.vatRate : null;
};

export const getCountryByVATRate = (vatRate: number): EUCountryVAT[] => {
  return EU_COUNTRIES_VAT.filter(
    c => Math.abs(c.vatRate - vatRate) < 0.01
  );
};

export const getHighestVATRate = (): EUCountryVAT => {
  return EU_COUNTRIES_VAT.reduce((highest, current) => 
    current.vatRate > highest.vatRate ? current : highest
  );
};

export const getLowestVATRate = (): EUCountryVAT => {
  return EU_COUNTRIES_VAT.reduce((lowest, current) => 
    current.vatRate < lowest.vatRate ? current : lowest
  );
};

export const getAverageVATRate = (): number => {
  const total = EU_COUNTRIES_VAT.reduce((sum, country) => sum + country.vatRate, 0);
  return total / EU_COUNTRIES_VAT.length;
};

// Export for easy access
export default EU_COUNTRIES_VAT;
