const DEFAULT_INPUT_TEXT = '';
const DEFAULT_OUTPUT_TEXT = '';
const DEFAULT_ORIGIN_LAN = ''; // Empty string means detect langauge
const DEFAULT_DESTINATION_LAN = 'en' // English

/**
 * Callback for rendering the main card.
 * @return {CardService.Card} The card to show the user.
 */
function onHomepage(e) {
  return createSelectionCard(e, DEFAULT_ORIGIN_LAN, DEFAULT_DESTINATION_LAN, DEFAULT_INPUT_TEXT, []);
}

/**
 * Main function to generate the main card.
 * @param {String} originLanguage Language of the original text.
 * @param {String} destinationLanguage Language of the translation.
 * @param {String} inputText The text to be translated.
 * @param {String} outputText The text translated.
 * @return {CardService.Card} The card to show to the user.
 */
function createSelectionCard(e, originLanguage, destinationLanguage, inputText, results) {
  var hostApp = e['hostApp'];
  var builder = CardService.newCardBuilder();

    var fromSection = CardService.newCardSection().addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Lint!')
        .setOnClickAction(CardService.newAction().setFunctionName('getDocsSelection'))
        .setDisabled(false)));

  builder.addSection(fromSection);
  if (results.length != 0) {
    var resSection = CardService.newCardSection();
    for (const res of results) {
        var wid = CardService.newKeyValue().setContent(res.message).setTopLabel(res.content);
        resSection.addWidget(wid);
      }
    builder.addSection(resSection);
  }

  //Buttons section
  builder.addSection(CardService.newCardSection()
    .addWidget(CardService.newButtonSet()
      // .addButton(CardService.newTextButton()
      //   .setText('Lint')
      //   .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      //   .setOnClickAction(CardService.newAction().setFunctionName('translateText'))
      //   .setDisabled(false))
      .addButton(CardService.newTextButton()
        .setText('Clear')
        .setOnClickAction(CardService.newAction().setFunctionName('clearText'))
        .setDisabled(false))));

  return builder.build();

}

/**
 * Helper function to generate the drop down language menu. It checks what language the user had selected.
 * @param {String} fieldName
 * @param {String} fieldTitle
 * @param {String} previousSelected The language the user previously had selected.
 * @return {CardService.SelectionInput} The card to show to the user.
 */
function generateLanguagesDropdown(fieldName, fieldTitle, previousSelected) {
  var selectionInput = CardService.newSelectionInput().setTitle(fieldTitle)
    .setFieldName(fieldName)
    .setType(CardService.SelectionInputType.DROPDOWN);

  LANGUAGE_MAP.forEach((language, index, array) => {
    selectionInput.addItem(language.text, language.val, language.val == previousSelected);
  })

  return selectionInput;
}

/**
 * Helper function to clean the text.
 * @return {CardService.Card} The card to show to the user.
 */
function clearText(e) {
  var originLanguage = undefined; // e.formInput.origin;
  var destinationLanguage = DEFAULT_DESTINATION_LAN; // e.formInput.destination;
  return createSelectionCard(e, originLanguage, destinationLanguage, DEFAULT_INPUT_TEXT, []);
}

function lint(text) {
  var baseUrl = 'https://glacial-refuge-77012.herokuapp.com/textlint';

  var options = {
    'method' : 'post',
    'contentType': 'text/plain',
    'payload' : text
  };

    var res = UrlFetchApp.fetch(baseUrl, options);
    var json = JSON.parse(res.getContentText());
    Logger.log(json);
    return json || [];
}

/**
 * Helper function to get the text selected.
 * @return {CardService.Card} The selected text.
 */
function getDocsSelection(e) {
  var text = '';
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var elements = selection.getRangeElements();
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().asText() && element.getElement().asText().getText() !== '') {
        Logger.log(element.getElement().asText().getText());
        text += element.getElement().asText().getText() + '\r\n';
      }
    }
  }

  if (text !== '') {
    var originLanguage = undefined;
    var destinationLanguage = DEFAULT_DESTINATION_LAN;
    var translation = lint(text);// LanguageApp.translate(text, originLanguage, destinationLanguage);
    return createSelectionCard(e, originLanguage, destinationLanguage, text, translation);
  }
}

