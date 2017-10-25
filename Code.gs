var ADDON_TITLE = 'GIFT form creator';
var documentProperties = PropertiesService.getDocumentProperties();
var form = FormApp.getActiveForm();
var giftCode = "True or false?{T}";
/**
 * Adds a custom menu to the active form to show the add-on sidebar.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
//  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  form.setIsQuiz(true);
  FormApp.getUi()
      .createAddonMenu()
      .addItem('Configure GIFT', 'showSidebar')
      .addToUi();
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
  giftCode = documentProperties.getProperty(form.getId());
  if(!giftCode) {
    giftCode = "True or false?{T}";
  }
  var html = HtmlService.createTemplateFromFile('Sidebar');
  html.giftCode = giftCode;
  var htmlOutput = html.evaluate().setTitle(ADDON_TITLE);
  FormApp.getUi().showSidebar(htmlOutput);
}
