function createForm(str, append) {
  try {
    var giftObj = giftParser.parse(str);
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
  if (!append) {
    form.getItems().forEach(function (entry) {
      form.deleteItem(entry);
    });
  }
  for (var i = 0; i < giftObj.length; i++) {
    addQuestion(form, giftObj[i]);
  }
}

function addQuestion(form, question) {

  var giftTitle = (question.title ? question.title // + " - " + question.stem.text
    : "");
  var stemText = stripHTML(question.stem.text);
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
      if (question.correctFeedback) {
        var correctFeedback = FormApp.createFeedback()
          .setText(stripHTML(question.correctFeedback.text))  // clear HTML formatting
          .build();
        item.setFeedbackForCorrect(correctFeedback);
      }
      if (question.incorrectFeedback && item) {
        var incorrectFeedback = FormApp.createFeedback()
          .setText(stripHTML(question.incorrectFeedback.text))
          .build();
        item.setFeedbackForIncorrect(incorrectFeedback);
      }
      item.setRequired(true);
      break;

    case "Essay":
      item = form.addParagraphTextItem().setTitle(stemText);
      item.setPoints(1);
      item.setRequired(true);
      break;

    case "MC":
      if (question.choices[0].weight) {
        item = form.addCheckboxItem().setTitle(stemText);
      } else {
        item = form.addMultipleChoiceItem().setTitle(stemText);
      }
      item.setPoints(1);
      item.setHelpText("Note: this MULTIPLE CHOICE question is not completely compatible with Google's quizzes. Individual feedback items for each answer are not (yet?) supported by Google. Feedback is aggregated into only CORRECT and INCORRECT.");

      var choices = [];
      if (question.choices) {
        var feedbackPositive = "";
        var feedbackNegative = "";
        for (var j = 0; j < question.choices.length; j++) {
          //Workaround to have some accepted answer on checkbox
          if (question.choices[j].weight && parseInt(question.choices[j].weight) > 0) {
            question.choices[j].isCorrect = true;
          }

          var choice = item.createChoice(stripHTML(question.choices[j].text.text), question.choices[j].isCorrect);
          // Not supported by google
          //  if(question.choices[j].weight){
          //    choice.setPoints(question.choices[j].weight);
          //  }
          if (question.choices[j].feedback) {
            var fbMsg = "\n" + stripHTML(question.choices[j].text.text) + " (" +
              (question.choices[j].isCorrect ? "correct" : "incorrect") + "): " + stripHTML(question.choices[j].feedback.text);
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
      item.setRequired(true);
      break;

    case "Matching":
      // API won't allow configuring choices as of 2018-07-19 even though the GUI will (Answer Key)
      item = form.addGridItem();
      var rows = [], cols = [];
      var choiceString = "";
      // collect rows and columns
      for (var j = 0; j < question.matchPairs.length; j++) {
        var pair = question.matchPairs[j];
        if (pair.subquestion.text != "") rows.push(stripHTML(pair.subquestion.text));
        add(cols, pair.subanswer); // apps script has no Set implementation
        choiceString += stripHTML(pair.subquestion.text) + " -> " + pair.subanswer + ", \n";
      }
      item.setTitle(stemText)
        .setRows(rows)
        .setColumns(cols);
      item.setHelpText("Note: this MATCHING question did not completely import from GIFT because Google's API doesn't allow creating the Answer Key (or setting the points). You can do it manually by matching the following answers:\n" + choiceString);
      // item.setPoints(1);     // not supported by Google (yet?)
      item.setRequired(true);
      break;

    case "Short":
      // API won't allow choices as of 2018-07-19 even though the GUI will (Answer Key)
      item = form.addTextItem().setTitle(stemText);
      var choiceString = "";
      for (var i = 0; i < question.choices.length; i++) { choiceString += question.choices[i].text.text + ', \n'; }
      item.setHelpText("Note: this SHORT ANSWER question did not completely import from GIFT because Google's API doesn't allow creating the accepted answers in the Answer Key. You can do it manually by adding the following answers:\n" + choiceString);
      item.setPoints(1);
      // TODO support feedback for specific answers?
      item.setRequired(true);
      break;

    case "Numerical":
      item = form.addTextItem().setTitle(stemText);
      item.setHelpText("Note: this NUMERICAL question did not completely import from GIFT because it's not compatible with Google Quizzes (yet?).");
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
      item.setRequired(true);
      break;

    default:
      throw "Unrecognized question type";
  }
}

// simulate an add in a Set
function add(set, item) {
  var found = false;
  for (var i = 0; i < set.length; i++) {
    if (set[i] == item) return;
  }
  set.push(item);
}

function stripHTML(str) {
  return str.replace(/<(?:.|\n)*?>/gm, '');
}