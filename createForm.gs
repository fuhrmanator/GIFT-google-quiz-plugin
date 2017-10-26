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

      //first check if multiple response are true and if so put checkbox and not exclusif bullet
      if(question.choices){
        for(var j=0; j<question.choices.length;j++){

        }
      }
      var choices = [];
      if(question.choices){
        var feedback="";
        for(var j=0; j<question.choices.length;j++){
          var choice = item.createChoice(question.choices[j].text, question.choices[j].isCorrect);

          if(question.choices[j].weight){
            //Grammar validate that its a int
            // TODO weight *point /100
            choice.setPoints(question.choices[j].weight);
          }
          if(question.choices[j].feedback){
            feedback.concat("\n " + question.choices[j].feedback);
          }
          choices.push(choice);
        }
        item.setChoices(choices);
        // Workaround GIFT only display feedback for selected answer --- VALIDATE THIS
        //item.setFeedbackForCorrect(FormApp.createFeedback().setDisplayText("allo"));
        //item.setFeedbackForIncorrect(FormApp.createFeedback().setDisplayText("aalo"));
      } else {
        throw "Missing different choice for the question";
      }

    }

    // Matching question
    else if(question.type == "Matching") {

    }

    // Numerical
    // DOC validation : https://developers.google.com/apps-script/reference/forms/text-validation-builder
    else if(question.type == "Numerical") {
      var item = form.addTextItem().setTitle(title);

      if(question.choices){
        if(question.choices.length == 1){
          if(question.choices.type == "simple"){
            var textValidation = FormApp.createTextValidation()
            .requireNumberEqualTo(question.choices.number)
            .build();
            item.setValidation(textValidation);
          }
          else if(question.choices.type == "range"){
            // TODO Validate that math operation work question.choices.number - question.choice.range
            var textValidation = FormApp.createTextValidation()
            .requireNumberBetween(question.choices.number - question.choice.range, question.choices.number + question.choice.range)
            .build();
            item.setValidation(textValidation);
          }
          else if(question.choices.type == "high-low"){
            var textValidation = FormApp.createTextValidation()
            .requireNumberBetween(question.choices.numberLow, question.choices.numberHigh)
            .build();
            item.setValidation(textValidation);
          }
        } else{
          for(var j=0; j<question.choices.length;j++){

          }
        }

    }
      else {
        throw "Missing different choice for the question";
      }
    }


    // Add feedback
    if(question.feedback1 && item) {
      item.setFeedbackForCorrect(FormApp.createFeedback().setDisplayText(question.feedback1).build());
    }
    if(question.feedback2 && item) {
      item.setFeedbackForIncorrect(FormApp.createFeedback().setDisplayText(question.feedback2).build());
    }
  }
}
