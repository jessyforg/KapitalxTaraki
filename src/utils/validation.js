// Phone number validation
export const validatePhoneNumber = (phoneNumber, isTyping = false) => {
  if (!phoneNumber) return { isValid: true, message: "" };
  
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // During typing, only check basic format
  if (isTyping) {
    // Allow partial numbers during typing
    if (cleanNumber.length <= 11) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Phone number cannot be longer than 11 digits"
    };
  }
  
  // For final validation (not typing)
  // Check if it's a valid Philippine phone number
  // Format: +63XXXXXXXXXX or 09XXXXXXXXX
  const phPhoneRegex = /^(?:\+?63|0)(?:9\d{9})$/;
  
  if (!phPhoneRegex.test(cleanNumber)) {
    return {
      isValid: false,
      message: "Please enter a valid Philippine phone number (e.g., +639123456789 or 09123456789)"
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
};

// Date validation
export const validateDate = (date, type = 'birthdate') => {
  if (!date) {
    return { isValid: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} is required` };
  }

  // Allow user to type the date
  if (date.length < 10) {
    return { isValid: true, message: '' }; // Allow partial input while typing
  }

  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const currentYear = new Date().getFullYear();

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Please enter a valid date (YYYY-MM-DD)' };
  }

  if (type === 'birthdate') {
    if (year < 1900 || year > currentYear) {
      return { isValid: false, message: 'Please enter a valid birth year between 1900 and present' };
    }

    if (dateObj > new Date()) {
      return { isValid: false, message: 'Birth date cannot be in the future' };
    }
  }

  return { isValid: true, message: '' };
}; 