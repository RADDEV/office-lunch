
let pageHTML;

var BodyExtractor = require('extract-main-text');

setLunchData();

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
        let dateReg = /(\S+\d)(?=г\.)/gm;
        let date = abc[0].match(dateReg);
        //console.log(abc[0]);
        console.log(date[0]);
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

        // for(let i = 1; i < desertsArray.length; i++){
        //     console.log(i+' '+desertsArray[i]);
        // }

         console.log(soupArray);
         console.log(mainDishArray);
         console.log(desertsArray);
    });
}
  

