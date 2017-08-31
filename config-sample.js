'use strict';

/* ---------------------------------------------\
\	- Configurations of Script					/
/	- Change only the next lines				\
\----------------------------------------------*/

let subdomain = 'Wufoo_Subdomain';
let auth = {
	'username': 'Wufoo_API_KEY',
	'password': 'Wufoo_Account_Password',
	'sendImmediately': false
}
let forms = ['Form_Hash'];

// The month to generate reports
let montly = true;
let month = '6';
let year = '2017';

/* ---------------------------------------------\
\	- Easy? This is all the config...			/
/	- Don't touch anything after this line		\
\----------------------------------------------*/

module.exports = { subdomain, auth, forms, montly, month, year };
