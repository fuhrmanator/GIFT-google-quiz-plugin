function createForm(str){
  var giftObj = parser.parse(str);
  Logger.log(giftObj.length);
  documentProperties.setProperty(form.getId(), str);
  for(var i =0; i<giftObj.length;i++){
    var question = giftObj[i];
    var title;
    question.title? title=question.title + " - " + question.stem: title = question.stem;
    if(question.type == "Description"){
      var item = form.addSectionHeaderItem();
      item.setTitle(title);
    }
    
    if(question.type == "TF"){
      var item = form.addMultipleChoiceItem();
      item.setTitle(title);
      item.setChoices([
        item.createChoice("Vrai", question.isTrue),
        item.createChoice("Faux", !question.isTrue)
      ]);
      // TODO 
      //item.setPoint(1);
    }
   
    
    
    
    
    
    
    
    
//     // Add feedback for true and false response
      if(question.feedback1) {
        item.setFeedbackForCorrect(FormApp.createFeedback().setDisplayText(question.feedback1).build());
      }
      if(question.feedback2) {
        item.setFeedbackForIncorrect(FormApp.createFeedback().setDisplayText(question.feedback2).build());
      }
  }
}
