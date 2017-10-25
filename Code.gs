var ADDON_TITLE = 'GIFT form creator';
var documentProperties = PropertiesService.getDocumentProperties();
var form = FormApp.getActiveForm();
/**
 * Adds a custom menu to the active form to show the add-on sidebar.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  gift_code = documentProperties.getProperty(form.getId()); 
  showSidebar(gift_code);
  form.setIsQuiz(true);
//  FormApp.getUi()
//      .createAddonMenu()
//      .addItem('Configure GIFT', 'showSidebar')
//      .addToUi();
}

/**
 * Runs when the add-on is installed.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE).
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the form containing the add-on's user interface for
 * configuring the notifications this add-on will produce.
 */
function showSidebar() {
  //var question = "You can use your pencil and paper for these next questions. True or false?{T}"
  //Logger.log(parser.parse(question));

  //Logger.log(parser.parse(question));
  var html = HtmlService.createTemplateFromFile('Sidebar');
      //.setSandboxMode(HtmlService.SandboxMode.IFRAME)
      //.setTitle('GIFT form creator');
  html.gift_code= gift_code;
  var htmlOutput = html.evaluate();
  FormApp.getUi().showSidebar(htmlOutput);
}



