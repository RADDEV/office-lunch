
let pageHTML;

var BodyExtractor = require('extract-main-text');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
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
function setLunchData(){
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
        console.log('\n')
        let lastMenu = abc[0];
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

        let soupArray = soups.split(itemRegex);
        let mainDishArray = mainDish.split(itemRegex);
        let desertsArray = deserts.split(itemRegex);

        for(let i = 1; i < desertsArray.length; i++){
            console.log(i+' '+desertsArray[i]);
        }

        //console.log("Sopu\n" + deserts);

        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Class Data!A2:E',
          }, function(err, responce){
              if(err){
                  console.log('The google sheets API has encountered and arror: ' + err);
                  return;
              }

              sheets.getCells({
                'min-row': 6,
                'max-row': 18,
                'return-empty': true 
              },function(err, cells){
                        
            });

          });
    });
}
  

