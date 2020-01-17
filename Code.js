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
var defaultGiftCode = "The sun sets in the east. {False}";

var documentProperties = PropertiesService.getDocumentProperties();
var form = FormApp.getActiveForm();
var giftCode;

/**
 * Adds a custom menu to the active form to show the add-on sidebar.
 *
 * @param {object} e The event parameter for a simple onOpen trig-ger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trig-ger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  form.setIsQuiz(true);  // TODO ask user before doing this?
  FormApp.getUi()
      .createAddonMenu()
      .addItem('Open editor', 'showSidebar')
      .addItem('About', 'showAbout')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 *
 * @param {object} e The event parameter for a simple onInstall trig-ger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trig-ger is
 *     running in, inspect e.authMode. (In practice, onInstall trig-gers always
 *     run in AuthMode.FULL, but onOpen trig-gers may be AuthMode.LIMITED or
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
    giftCode = defaultGiftCode;
  }
  var html = HtmlService.createTemplateFromFile('Sidebar');
  html.giftCode = giftCode;
  var htmlOutput = html.evaluate().setTitle(ADDON_TITLE);
  FormApp.getUi().showSidebar(htmlOutput);
}

function showAbout() {
  var ui = HtmlService.createHtmlOutputFromFile('About')
//      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setWidth(420)
      .setHeight(270);
  FormApp.getUi().showModalDialog(ui, 'About GIFT Quiz Editor');
}


