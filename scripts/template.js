
  var async = require( "async" );
  var fs = require( "fs" );
  var jquery = require( "jquery" );
  var popper = require( "popper.js" );
  var hogan = require( "hogan.js" );

  var templateFilePath = "./template.html",
      europassJsonFilePath = "./data_files/europass-cv.json",
      skillsJsonFilePath = "./data_files/Skills.json",
      htmlFilePath = "../index.html";

  var readAsync = function ( file, callback ) {
      fs.readFile( file, "utf8", callback );
  }

  var fileReadCallback = function( err, results ) {

    // compile the template
    var templateContent = results[ 0 ];
    console.log( "Compiling template file contents: %s", templateFilePath );
    var template = hogan.compile( templateContent );
         
    // parse JSON files
    console.log( "Parsing Europass JSON file contents: %s", europassJsonFilePath );
    var jsonContent = results[ 1 ];
    var eruopass = JSON.parse( jsonContent );
    
    console.log( "Parsing skills JSON file contents: %s", skillsJsonFilePath );
    var skillsJsonContent = results[ 2 ];
    var skills = JSON.parse( skillsJsonContent );
    
    // render the template
    var context = eruopass;
    context[ "Skills" ] = skills;
 
    // wrapper function for rendering skills scores
    context[ "renderSkillsScore" ] = function() {
      return function(scoreText) {
        var text = "";
        var score = this.Score;
        
        for(var i=0; i<5; i++){
          var className = i<score ? "on" : "off";
          text += "<span class=\"entypo entypo-record " + className + "\"></span>";
        }
        
        return text;
      };
    };

    // wrapper function for rendering skills scores
    context[ "periodText" ] = function() {
      return function(periodText) {
        var months = [ "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December" ];

        var text = months[this.Period.From.Month] +" "+ this.Period.From.Year + " - "
        if (this.Period.Current) {
          text += "Present"
        } else {
          text +=  months[this.Period.To.Month] +" "+ this.Period.To.Year
        }
        return text
      };
    };
    context[ "linguisticPercent" ] = function() {
      //"ProficiencyLevel" : {
      //  "Listening" : "C2",
      //      "Reading" : "C2",
      //      "SpokenInteraction" : "C2",
      //      "SpokenProduction" : "C2",
      //      "Writing" : "C2"
      //}


      return function(periodText) {
        var percent = {
          'A1': 0.00,
          'A2': 0.20,
          'B1': 0.40,
          'B2': 0.60,
          'C1': 0.80,
          'C2': 1.00
        };

        var percentil = percent[this.ProficiencyLevel.Listening]
            + percent[this.ProficiencyLevel.Reading]
            + percent[this.ProficiencyLevel.SpokenInteraction]
            + percent[this.ProficiencyLevel.SpokenProduction]
            + percent[this.ProficiencyLevel.Writing]

        return percentil / 5
      };
    };
    
    // process achievements
    if ( context.SkillsPassport.LearnerInfo.Achievement ) {
      for (var i = 0; i < context.SkillsPassport.LearnerInfo.Achievement.length; i++) {
        var code = context.SkillsPassport.LearnerInfo.Achievement[i].Title.Code;
        context.SkillsPassport.LearnerInfo.Achievement[i][code] = true;
      }
    }
    
    console.log( "Rendering template..." );
    var htmlContent = template.render( context );
     
    // outputs HTML content
    console.log( "Saving HTML file to %s.", htmlFilePath );
    fs.writeFile( htmlFilePath, htmlContent, function(err) {
      if(err) {
        console.log(err);
      }
      else {
        console.log( "The HTML file was saved to %s.", htmlFilePath );
      }
    });

  };

  
  async.map(
    [ 
      templateFilePath, 
      europassJsonFilePath, 
      skillsJsonFilePath
    ], 
    readAsync, 
    fileReadCallback
  );





