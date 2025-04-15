document.addEventListener('DOMContentLoaded', function() {
  var resetPinBtn = document.getElementById('reset_Pin_Execute');
  var pdocField = document.getElementById('reset_Pin_PDOC');
  var responseField = document.getElementById('reset_Pin_Response');
  var messageField = document.getElementById('reset_Pin_Message');

  function generateRandomNumber() {
    var randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return '00000000000' + '9' + randomPart;
  }

  function resetPin() {
    var generatedNumber = generateRandomNumber();
    pdocField.value = generatedNumber;
    responseField.value = 'Reset Successful';
    messageField.value = 'Create New Pin';

    // Save the generated values to local storage
    localStorage.setItem('reset_Pin_PDOC', generatedNumber);
    localStorage.setItem('reset_Pin_Response', 'Reset Successful');
    localStorage.setItem('reset_Pin_Message', 'Create New Pin');
  }

  function loadSavedValues() {
    var savedPDOC = localStorage.getItem('reset_Pin_PDOC');
    var savedResponse = localStorage.getItem('reset_Pin_Response');
    var savedMessage = localStorage.getItem('reset_Pin_Message');

    if (savedPDOC && savedResponse && savedMessage) {
      pdocField.value = savedPDOC;
      responseField.value = savedResponse;
      messageField.value = savedMessage;
    }
  }

  resetPinBtn.addEventListener('click', resetPin);
  loadSavedValues();
});