
let pageHTML;

var BodyExtractor = require('extract-main-text');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), setLunchData);
    setInterval(function(){
      console.log("Table updated :)");
      authorize(JSON.parse(content), setLunchData);
    },300000);
  });
  
  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
      });
    });
  }
  
  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
  }
  
  /*
*Set the google spreadsheet data with todays lunch avaliable at their Facebook page
* https://docs.google.com/spreadsheets/d/12i68YkBobxZsn0Prbvob-wHbSZr1Qx8lD--YNYaeAXc/edit#gid=0
*/
function setLunchData(auth){
    var extractor = new BodyExtractor({
        url: 'https://www.facebook.com/pg/RestorantOtecestvo/posts/?ref=page_internal'
    });
    extractor.analyze().then(function(text) {
        //pageHTML = extractor.html;
        // console.log(extractor.title);
        // console.log(extractor.mainText);
        //console.log(extractor.html);
        pageHTML = extractor.html;
    }).then(function(){
        //console.log(pageHTML);
        let myReg = /Ресторант „Отечество“([\S\s]*?)<\/div>/gm;
        let abc = pageHTML.match(myReg);
        
        let lastMenu = abc[0];
        let dateReg = /(\S+\d)(?=г\.)/gm;
        let date = abc[0].match(dateReg);
        var d = new Date();
        var day = d.getDate();
        var month = d.getMonth();
        var year = d.getFullYear();
        //if(date != day+'.'+(month+1)+'.'+year.toString().substr(-2)){
			console.log('Greda');
			console.log(date);
			console.log(day+'.'+(month+1)+'.'+year.toString().substr(-2));
			//return;
        //}
        //console.log(abc[0]);
        let brReg = /<br \/>/gm;
        let tagReg = /<.+>/gm;
        let parReg = /<p>/gm;
        lastMenu = lastMenu.replace(brReg,'\n');
        lastMenu = lastMenu.replace(parReg,'\n');
        lastMenu = lastMenu.replace(tagReg,'');
        //console.log(lastMenu);

        let soups = (lastMenu.split('Ястия')[0]).split('Супи')[1];
        let mainDish = (lastMenu.split('Ястия')[1]).split('Десерти')[0];
        let deserts = lastMenu.split('Десерти')[1];

        let itemRegex = /\d\./gm;

        let soupArray = soups.split(itemRegex).filter(function(a){return a !== '\n '});
        let mainDishArray = mainDish.split(itemRegex).filter(function(a){return a !== '\n '});
        let desertsArray = deserts.split(itemRegex).filter(function(a){return a !== '\n '});

        // for(let i = 1; i < desertsArray.length; i++){
        //     console.log(i+' '+desertsArray[i]);
        // }

        //console.log("Sopu\n" + deserts);

        var sheets = google.sheets('v4');
        
        // sheets.spreadsheets.values.get({
        //     auth: auth,
        //     spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        //     range: 'Class Data!A2:E',
        //   }, function(err, responce){
        //       if(err){
        //           console.log('The google sheets API has encountered and arror: ' + err);
        //           return;
        //       }

        //       sheets.getCells({
        //         'min-row': 6,
        //         'max-row': 18,
        //         'return-empty': true 
        //       },function(err, cells){
                        
        //     });

        //   });

        let values = [
          [
            soupArray[0]
          ],
          [
            soupArray[1]
          ],
          [
            soupArray[2]
          ],
          [
            soupArray[3]
          ],
          [
            mainDishArray[0]
          ],
          [
            mainDishArray[1]
          ],
          [
            mainDishArray[2]
          ],
          [
            mainDishArray[3]
          ],
          [
            desertsArray[0]
          ],
          [
            desertsArray[1]
          ],
          [
            desertsArray[2]
          ],
          [
            desertsArray[3]
          ]
        ];

        let body = {
          values:values
        };

        sheets.spreadsheets.values.update({
          spreadsheetId: '12i68YkBobxZsn0Prbvob-wHbSZr1Qx8lD--YNYaeAXc',
          range: 'Sheet1!B6:B18',
          auth:auth,
          valueInputOption: "USER_ENTERED",
          resource: body          
        }, function(err, result){
          if(err){
            console.log(err);
          }
          else{
            console.log('%d cells updated.', result.updatedCells);
          }
        });

        sheets.spreadsheets.values.update({
          spreadsheetId: '12i68YkBobxZsn0Prbvob-wHbSZr1Qx8lD--YNYaeAXc',
          range: 'Sheet1!B1:B1',
          auth:auth,
          valueInputOption: "USER_ENTERED",
          resource: {values:[date]}        
        }, function(err, result){
          if(err){
            console.log(err);
          }
          else{
            console.log('%d cells updated.', result.updatedCells);
          }
        });

    });
}
  

