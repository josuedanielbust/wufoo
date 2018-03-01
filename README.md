# Pull leads from Wufoo Contact Forms

##
1. First of all you need to install the latest version of NodeJS.
	
    _If you don't have yet **NodeJS** please install it downloading and installing from [nodejs.org](https://nodejs.org/)._

2. Open a terminal in your computer.
	* **Mac:** Terminal
	* **Windows:** CMD

3. Go to the folder where this package is located using ```cd ../path/to/folder/```

4. Install the script using ```npm install```

5. Create the ```config.js``` file. _(On the folder is located a config sample file)_

```javascript
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
```

6. Run using the ```npm start``` command
7. Check your folder and get every **.csv** file
8. Import the file on your excel using the " **|** " symbol as separated character.


##
### Dependencies

* request: ^2.81.0 => [https://www.npmjs.com/package/request](https://www.npmjs.com/package/request)


##
### Contributors
* Josue Daniel Bustamante: [JosueDanielBust](https://github.com/josuedanielbust)
* Jesse Cogollo: [jessecogollo](https://github.com/jessecogollo)
