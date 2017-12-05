function createForm(str, create, append){
  try {
    var giftObj = giftParser.parse(str);
    if(!create){
      throw "Everything looks good!"
    }
  }
  catch(err) {
    if(err.location){
      // Set up the error message with proper context
      var badGIFT="";
      var index = err.location.start.offset;
      var paddingBefore= "";
      var paddingAfter= "";
      var underlinedText = "<u>"+str.substring(err.location.start.offset,err.location.end.offset+1)+"</u>";

      if(err.location.start.offset-20>0){
        paddingBefore = str.substring(err.location.start.offset-20,err.location.start.offset-1);
      } else if(err.location.start.offset !=0){
        paddingBefore = str.substring(0,err.location.start.offset-1);
      }

      if(err.location.end.offset+20<str.length){
        paddingAfter= str.substring(err.location.end.offset+2,err.location.end.offset+20);
      } else if(err.location.end.offset !=str.length){
        paddingAfter= str.substring(err.location.end.offset+2, str.length);
      }

      badGIFT=paddingBefore+underlinedText+paddingAfter;
      throw new Error("Line "+parseInt(err.location.start.line)+", column "+parseInt(err.location.start.column)+" near:<b> "+badGIFT+"</b><br> "+err.message);
    } else {
      throw err;
    }
  }
  documentProperties.setProperty(form.getId(), str);
  // Clear all questions in the form
  if(create && !append){
    form.getItems().forEach(function(entry) {
      form.deleteItem(entry);
    });
  }
  if(create || append) {
    for(var i=0; i<giftObj.length;i++){
      var question = giftObj[i];

      var title;
      question.title? title=question.title + " - " + question.stem: title = question.stem;

        // Description
      if(question.type == "Description"){
        var item = form.addSectionHeaderItem();
        item.setTitle(title);
      }

        // True or false
      else if(question.type == "TF"){
        var item = form.addMultipleChoiceItem().setTitle(title);
        item.setPoints(1);
        item.setChoices([
          item.createChoice("True", question.isTrue),
          item.createChoice("False", !question.isTrue)
        ]);

         // Add feedback
        if(question.correctFeedback) {
          var correctFeedback = FormApp.createFeedback()
           .setText(question.correctFeedback)
           .build();
          item.setFeedbackForCorrect(correctFeedback);
        }
        if(question.incorrectFeedback && item) {
          var incorrectFeedback = FormApp.createFeedback()
           .setText(question.incorrectFeedback)
           .build();
          item.setFeedbackForIncorrect(incorrectFeedback);
        }
      }

        // Essay
      else if(question.type == "Essay") {
        var item = form.addParagraphTextItem().setTitle(title);
      }

      // Multiple Choice
      else if(question.type == "MC") {
        var item;
        if(question.choices[0].weight){
          item = form.addCheckboxItem().setTitle(title);
        } else {
          item = form.addMultipleChoiceItem().setTitle(title);
        }
        item.setPoints(1);

        var choices = [];
        if(question.choices){
          var feedbackPositive="";
          var feedbackNegative="";
          for(var j=0; j<question.choices.length;j++){
            //Workaround to have some accepted answer on checkbox
            if(question.choices[j].weight && parseInt(question.choices[j].weight) > 0){
              question.choices[j].isCorrect = true;
            }

            var choice = item.createChoice(question.choices[j].text, question.choices[j].isCorrect);
            // Not supported by google
            //  if(question.choices[j].weight){
            //    choice.setPoints(question.choices[j].weight);
            //  }
            if(question.choices[j].feedback){
              Logger.log('Adding feedback');
              if(question.choices[j].isCorrect == true){
                feedbackPositive+=("\n " + question.choices[j].feedback);
              } else {
                feedbackNegative+=("\n " + question.choices[j].feedback);
              }
            }
            choices.push(choice);
          }
          item.setChoices(choices);
          //TODO set feedback
          // Workaround Google set feedback for correct and incorrect answer while GIFT is set per choice
          if(feedbackPositive){
            var correctFeedback = FormApp.createFeedback()
            .setText(feedbackPositive)
            .build();
            item.setFeedbackForCorrect(correctFeedback);
          }
          if(feedbackNegative){
            var incorrectFeedback = FormApp.createFeedback()
            .setText(feedbackNegative)
            .build();
            item.setFeedbackForIncorrect(incorrectFeedback);
          }
        }
        else {
          throw "Missing different choice for the question";
        }
      }

      // Matching question
      else if(question.type == "Matching") {
        // TODO gridItem
      }

      // Numerical
      else if(question.type == "Numerical") {
        var item = form.addTextItem().setTitle(title);
        item.setPoints(1);

        if(question.choices){
          if(typeof question.choices == 'object'){
            if(question.choices.feedback){
              var correctFeedback = FormApp.createFeedback()
              .setText(question.choices.feedback)
              .build();
              item.setFeedbackForCorrect(correctFeedback);
            }
        }
        else {
          throw "Missing different choice for the question";
        }
        }
      }
    }
    throw giftObj.length + " question(s) added.";
  }
}
