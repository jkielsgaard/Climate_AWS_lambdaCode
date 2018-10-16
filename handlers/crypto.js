var crypto = require('crypto');

/// To crypt and decrypt strings eg. Password

module.exports = {
    crypt: function(password) {
       
        var key = crypto.createCipher('aes-128-cbc', 'zqMR9cgdRPJDyd9g');
        var str = key.update(password, 'utf8', 'hex');
        str += key.final('hex');
        
        return str;
    },
    decrypt: function(crypt) {
        
        var key = crypto.createDecipher('aes-128-cbc', 'zqMR9cgdRPJDyd9g');
        var str = key.update(crypt, 'hex', 'utf8');
        str += key.final('utf8');
        
        return str; 
    }
};