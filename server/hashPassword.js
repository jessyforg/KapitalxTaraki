const bcrypt = require('bcryptjs');

const password = 'Demo1234';

bcrypt.genSalt(10, function(err, salt) {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }
  
  bcrypt.hash(password, salt, function(err, hash) {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    console.log('Original password:', password);
    console.log('Hashed password:', hash);
  });
}); 