/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/**
 * A global constant String holding the title of the add-on. This is
 * used to identify the add-on in the notification emails.
 */
var ADDON_TITLE = 'GIFT Quiz Editor'; 

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
      .addItem('Create/Edit GIFT', 'showSidebar')
      .addItem('About', 'showAbout')
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

function showAbout() {
  var ui = HtmlService.createHtmlOutputFromFile('About')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setWidth(420)
      .setHeight(270);
  FormApp.getUi().showModalDialog(ui, 'About GIFT Quiz Editor');
}


