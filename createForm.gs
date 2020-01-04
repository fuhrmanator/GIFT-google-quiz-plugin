function createForm(str, create, append) {
	try {
		var giftObj = giftParser.parse(str);
		if (!create) {
			throw "Everything looks good!"
		}
	} catch (err) {
		if (err.location) {
			// Set up the error message with proper context
			var badGIFT = "";
			var index = err.location.start.offset;
			var paddingBefore = "";
			var paddingAfter = "";
			var underlinedText = "<u>" + str.substring(err.location.start.offset, err.location.end.offset + 1) + "</u>";

			if (err.location.start.offset - 20 > 0) {
				paddingBefore = str.substring(err.location.start.offset - 20, err.location.start.offset - 1);
			} else if (err.location.start.offset != 0) {
				paddingBefore = str.substring(0, err.location.start.offset - 1);
			}

			if (err.location.end.offset + 20 < str.length) {
				paddingAfter = str.substring(err.location.end.offset + 2, err.location.end.offset + 20);
			} else if (err.location.end.offset != str.length) {
				paddingAfter = str.substring(err.location.end.offset + 2, str.length);
			}

			badGIFT = paddingBefore + underlinedText + paddingAfter;
			throw new Error("Line " + parseInt(err.location.start.line) + ", column " + parseInt(err.location.start.column) + " near:<b> " + badGIFT + "</b><br> " + err.message);
		} else {
			throw err;
		}
	}
	documentProperties.setProperty(form.getId(), str);
	// Clear all questions in the form
	if (create && !append) {
		form.getItems().forEach(function (entry) {
			form.deleteItem(entry);
		});
	}
	if (create || append) {
		for (var i = 0; i < giftObj.length; i++) {
			addQuestion(form, giftObj[i]);
    	}
		// throw giftObj.length + " question(s) added.";
	}
}

function addQuestion(form, question) {
  
  var giftTitle = (question.title ? question.title // + " - " + question.stem.text
				 : "");
  var stemText = question.stem.text.replace(/<(?:.|\n)*?>/gm, '');
  var item;
  switch (question.type) {
    case "Description":
      item = form.addSectionHeaderItem();
      item.setTitle(giftTitle);
      item.setHelpText(stemText);
      break;
      
    case "TF":
      item = form.addMultipleChoiceItem().setTitle(stemText);
      item.setPoints(1);
      item.setChoices([
        item.createChoice("True", question.isTrue),
        item.createChoice("False", !question.isTrue)
      ]);
      
      // Add feedback
      if (question.correctFeedback.text) {
        var correctFeedback = FormApp.createFeedback()
        .setText(question.correctFeedback.text.replace(/<(?:.|\n)*?>/gm, ''))
        .build();
        item.setFeedbackForCorrect(correctFeedback);
      }
      if (question.incorrectFeedback && item) {
        var incorrectFeedback = FormApp.createFeedback()
        .setText(question.incorrectFeedback.text.replace(/<(?:.|\n)*?>/gm, ''))
        .build();
        item.setFeedbackForIncorrect(incorrectFeedback);
      }
      break;
      
    case "Essay":
      item = form.addParagraphTextItem().setTitle(stemText);
      item.setPoints(1);
      break;
      
    case "MC":
      if (question.choices[0].weight) {
        item = form.addCheckboxItem().setTitle(stemText);
      } else {
        item = form.addMultipleChoiceItem().setTitle(stemText);
      }
      item.setPoints(1);
      item.setHelpText("Note: this question is not completely compatible with Google's quizzes, because they don't support individual feedback items for each answer.");
      
      var choices = [];
      if (question.choices) {
        var feedbackPositive = "";
        var feedbackNegative = "";
        for (var j = 0; j < question.choices.length; j++) {
          //Workaround to have some accepted answer on checkbox
          if (question.choices[j].weight && parseInt(question.choices[j].weight) > 0) {
            question.choices[j].isCorrect = true;
          }
          
          var choice = item.createChoice(question.choices[j].text.text.replace(/<(?:.|\n)*?>/gm, ''), question.choices[j].isCorrect);
          // Not supported by google
          //  if(question.choices[j].weight){
          //    choice.setPoints(question.choices[j].weight);
          //  }
          if (question.choices[j].feedback.text) {
            // Logger.log('Adding feedback');
            var fbMsg = "\n" + question.choices[j].text.text.replace(/<(?:.|\n)*?>/gm, '') + " (" + 
              (question.choices[j].isCorrect ? "correct" : "incorrect") + "): " + question.choices[j].feedback.text.replace(/<(?:.|\n)*?>/gm, '')
            if (question.choices[j].isCorrect) {
              feedbackPositive += fbMsg;
            } else {
              feedbackNegative += fbMsg;
            }
          }
          choices.push(choice);
        }
        item.setChoices(choices);
        //TODO set feedback
        // Workaround Google set feedback for correct and incorrect answer while GIFT is set per choice
        if (feedbackPositive) {
          var correctFeedback = FormApp.createFeedback()
          .setText(feedbackPositive)
          .build();
          item.setFeedbackForCorrect(correctFeedback);
        }
        if (feedbackNegative) {
          var incorrectFeedback = FormApp.createFeedback()
          .setText(feedbackNegative)
          .build();
          item.setFeedbackForIncorrect(incorrectFeedback);
        }
      } else {
        throw "Missing different choice for the question";
      }
      break;
      
    case "Matching":
      item = form.addGridItem();
      var rows = [], cols = [];
      var choiceString = "";
      // collect rows and columns
      for (var j = 0; j < question.matchPairs.length; j++) {
        var pair = question.matchPairs[j];
        if (pair.subquestion.text != "") rows.push(pair.subquestion.text.replace(/<(?:.|\n)*?>/gm, ''));
        add(cols, pair.subanswer); // apps script has no Set implementation
        choiceString += pair.subquestion.text.replace(/<(?:.|\n)*?>/gm, '') + " -> " + pair.subanswer + "\n";
      }
      item.setTitle(stemText)
        .setRows(rows)
        .setColumns(cols);
      item.setHelpText("Note: this question did not completely import from GIFT because Google's API doesn't allow creating the Answer Key. You can do it manually by matching the following answers:\n" + choiceString);

      break;
      
    case "Short":
      // API won't allow choices as of 2018-07-19 even though the GUI will (Answer Key)
//      var choices = [];
      item = form.addTextItem().setTitle(stemText);
      var choiceString = "";
      for (var i=0; i<question.choices.length; i++) { choiceString += question.choices[i].text.text + '\n'; }
      item.setHelpText("Note: this question did not completely import from GIFT because Google's API doesn't allow creating the accepted answers in the Answer Key. You can do it manually by adding the following answers:\n" + choiceString);
      item.setPoints(1);
//      for (var i=0; i<question.choices.length; i++) {
//        choices.push(item.createChoice(question.choices[i].text.text, question.choices[i].isCorrect)); 
//      }
//      item.setChoices(choices);
      // TODO support feedback for specific answers?
      break;
      
    case "Numerical":
      item = form.addTextItem().setTitle(stemText);
      item.setHelpText("Note: this question did not completely import from GIFT because it's not compatible with Google Quizzes (yet?).");
      item.setPoints(1);
      // 
      if (question.choices) {
        if (typeof question.choices == 'object') {
          if (question.choices.feedback) {
            var correctFeedback = FormApp.createFeedback()
            .setText(question.choices.feedback)
            .build();
            item.setFeedbackForCorrect(correctFeedback);
          }
        } else {
          throw "Missing different choice for the question";
        }
      }
      break;
      
    default:
      break;
}}

// simulate an add in a Set
function add(set, item){
  var found = false;
  for (var i=0; i<set.length; i++) {
    if (set[i] == item) return;
  }
  set.push(item);
}