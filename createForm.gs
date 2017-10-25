function createForm(str){
  try {
    var giftObj = parser.parse(str);
  }
  catch(err) {
    throw err;
  }
  documentProperties.setProperty(form.getId(), str);
  // Clear all questions in the form
  form.getItems().forEach(function(entry) {
    form.deleteItem(entry);
  });

  Logger.log(giftObj);
  for(var i=0; i<giftObj.length;i++){
    var question = giftObj[i];

    var title;
    question.title? title=question.title + " - " + question.stem: title = question.stem;

    Logger.log(title);
      // Description
    if(question.type == "Description"){
      var item = form.addSectionHeaderItem();
      item.setTitle(title);
    }

      // True or false
    else if(question.type == "TF"){
      var item = form.addMultipleChoiceItem().setTitle(title);
      item.setChoices([
        item.createChoice("True", question.isTrue),
        item.createChoice("False", !question.isTrue)
      ]);
      // TODO
      //item.setPoint(1);
    }

      // Essay
    else if(question.type == "Essay") {
      var item = form.addParagraphTextItem().setTitle(title);
    }

    // Multiple Choice
    else if(question.type == "MC") {
      var item = form.addMultipleChoiceItem().setTitle(title);

      var choices = [];
      if(question.choices){
        for(var j=0; j<question.choices.length;j++){
          var choice = item.createChoice(question.choices[j].text, question.choices[j].isCorrect);

          if(question.choices[j].weight){
            //TODO validate if integer (or validate that grammar doesnt support weight being something other than an integer)
            choice.setPoints(question.choices[j].weight);
          }

          //TODO add feedback from question.choices[i].feedback
          choices.push(choice);
        }
        item.setChoices(choices);
      } else {
        throw "Missing different choice for the question";
      }

    }

    // Matching question
    else if(question.type == "Matching") {

    }

    // Numerical
    else if(question.type == "Numerical") {
      var item = form.addParagraphTextItem().setTitle(title);
      if(question.choices){
        for(var k=0; k<question.choices.length;k++){

          //TODO setValidation(validation)
        }

    }
      else {
        throw "Missing different choice for the question";
      }
    }


    // Add feedback
    if(question.feedback1) {
      item.setFeedbackForCorrect(FormApp.createFeedback().setDisplayText(question.feedback1).build());
    }
    if(question.feedback2) {
      item.setFeedbackForIncorrect(FormApp.createFeedback().setDisplayText(question.feedback2).build());
    }
  }
}
