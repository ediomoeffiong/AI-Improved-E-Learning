import React, { useState, useEffect, useRef } from 'react';
import { COUNTRY_CODES, POPULAR_COUNTRIES, parsePhoneNumber } from '../constants/countryCodes';

const PhoneNumberInput = ({
  value = '',
  onChange,
  onCountryChange,
  placeholder = 'Enter phone number',
  disabled = false,
  required = false,
  className = '',
  error = '',
  label = 'Phone Number'
}) => {
  const [phoneData, setPhoneData] = useState(() => {
    const parsed = parsePhoneNumber(value);
    return {
      countryCode: parsed.countryCode,
      phoneNumber: parsed.phoneNumber
    };
  });

  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Update internal state when value prop changes
  useEffect(() => {
    const parsed = parsePhoneNumber(value);
    setPhoneData({
      countryCode: parsed.countryCode,
      phoneNumber: parsed.phoneNumber
    });
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePhoneNumberChange = (newPhoneNumber) => {
    const updatedData = { ...phoneData, phoneNumber: newPhoneNumber };
    setPhoneData(updatedData);
    
    const fullNumber = `${updatedData.countryCode}${newPhoneNumber.replace(/\D/g, '')}`;
    onChange?.(fullNumber);
  };

  const handleCountryCodeChange = (newCountryCode) => {
    const updatedData = { ...phoneData, countryCode: newCountryCode };
    setPhoneData(updatedData);
    
    const fullNumber = `${newCountryCode}${updatedData.phoneNumber.replace(/\D/g, '')}`;
    onChange?.(fullNumber);
    onCountryChange?.(newCountryCode);
    
    setShowCountryDropdown(false);
    setCountrySearch('');
  };

  const formatPhoneInput = (input) => {
    // Only allow digits, spaces, hyphens, and parentheses
    let value = input.replace(/[^\d\s\-\(\)]/g, '');
    
    // Auto-format phone number as user types (basic formatting)
    if (value.replace(/\D/g, '').length <= 10) {
      // Format as: XXX XXX XXXX
      const digits = value.replace(/\D/g, '');
      if (digits.length >= 6) {
        value = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      } else if (digits.length >= 3) {
        value = `${digits.slice(0, 3)} ${digits.slice(3)}`;
      } else {
        value = digits;
      }
    }
    
    return value;
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === phoneData.countryCode);

  const filteredCountries = COUNTRY_CODES.filter(country => 
    country.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );

  const renderCountryList = () => {
    if (!countrySearch) {
      const popularCountries = POPULAR_COUNTRIES
        .map(code => COUNTRY_CODES.find(c => c.code === code))
        .filter(Boolean);
      const otherCountries = filteredCountries.filter(country => 
        !POPULAR_COUNTRIES.includes(country.code)
      );
      
      return [
        ...popularCountries.map((country, index) => (
          <div key={`popular-${index}`}>
            {index === 0 && (
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                Popular Countries
              </div>
            )}
            <CountryOption
              country={country}
              isSelected={phoneData.countryCode === country.code}
              onClick={() => handleCountryCodeChange(country.code)}
            />
          </div>
        )),
        otherCountries.length > 0 && (
          <div key="separator" className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
            All Countries
          </div>
        ),
        ...otherCountries.map((country, index) => (
          <CountryOption
            key={`other-${index}`}
            country={country}
            isSelected={phoneData.countryCode === country.code}
            onClick={() => handleCountryCodeChange(country.code)}
          />
        ))
      ].filter(Boolean);
    }
    
    return filteredCountries.map((country, index) => (
      <CountryOption
        key={index}
        country={country}
        isSelected={phoneData.countryCode === country.code}
        onClick={() => handleCountryCodeChange(country.code)}
      />
    ));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex space-x-2">
        {/* Country Code Selector */}
        <div className="relative min-w-[140px]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className={`w-full bg-white dark:bg-gray-700 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white flex items-center justify-between ${
              error 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={disabled}
          >
            <span className="flex items-center">
              {selectedCountry ? (
                <>
                  <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                  <span className="font-mono">{selectedCountry.code}</span>
                </>
              ) : (
                <span className="font-mono">{phoneData.countryCode}</span>
              )}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showCountryDropdown && (
            <div className="absolute z-50 w-80 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              
              {/* Country List */}
              <div className="max-h-48 overflow-y-auto">
                {renderCountryList()}
              </div>
            </div>
          )}
        </div>
        
        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneData.phoneNumber}
          onChange={(e) => {
            const formatted = formatPhoneInput(e.target.value);
            handlePhoneNumberChange(formatted);
          }}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm font-mono ${
            error 
              ? 'border-red-300 dark:border-red-600' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={disabled}
          required={required}
          maxLength={15}
        />
      </div>
      
      {/* Format Helper */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Example: {phoneData.countryCode} 123 456 7890
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

const CountryOption = ({ country, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center ${
      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    }`}
  >
    <span className="mr-3 text-lg">{country.flag}</span>
    <span className="mr-3 font-mono text-blue-600 dark:text-blue-400 min-w-[50px]">{country.code}</span>
    <span className="text-gray-700 dark:text-gray-300 truncate">{country.country}</span>
  </button>
);

export default PhoneNumberInput;
