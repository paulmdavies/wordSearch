$(document).ready(function () {
  const DIMENSION = 5;

  const DISTRIBUTION = [9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1]
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z']
  const DISTRIBUTION_LETTERS = [];

  for (var letter_index = 0; letter_index < LETTERS.length; letter_index++) {
    const letter = LETTERS[letter_index];
    for (var count = 0; count < DISTRIBUTION[letter_index]; count++) {
      DISTRIBUTION_LETTERS.push(letter)
    }
  }

  function randomLetter() {
    let index = Math.floor(Math.random() * DISTRIBUTION_LETTERS.length);
    return DISTRIBUTION_LETTERS[index]
  }

  for (var row = 0; row < DIMENSION; row++) {
    $('#grid').append('<tr></tr>');
    for (var column = 0; column < DIMENSION; column++) {
      $('#grid tr:last').append("<td class='gridSquare' id='g" + row + "#" + column + "' data-row='" + row + "' data-column='" + column + "'>" + randomLetter() + "</td>")
    }
  }

  var word = "";
  var selectedSquares = [];

  $('.gridSquare').click(function () {
    let element = $(this);

    if (element.hasClass('clicked')) {
      let lastSelectedSquare = selectedSquares.pop();
      if (element.attr('id') !== lastSelectedSquare.attr('id')) {
        resetWord()
      } else {
        removeLetterFromWord()
        element.removeClass('clicked');
      }
    } else {
      let previousSelectedSquare = selectedSquares.pop();

      if (previousSelectedSquare) {
        let previousRow = previousSelectedSquare.attr('data-row');
        let previousColumn = previousSelectedSquare.attr('data-column');
        let row = element.attr('data-row');
        let column = element.attr('data-column');
        if (Math.max(Math.abs(previousRow - row), Math.abs(previousColumn - column)) > 1) {
          resetWord();
        }
      }
      addLetterToWord(element.text().trim());
      element.addClass('clicked');
      selectedSquares.push(previousSelectedSquare, element);
    }
  })

  $('#submit-word').click(function () {
    let scoreElement = $('#score');
    let currentScore = parseInt(scoreElement.text());

    scoreElement.text(currentScore + word.length);

    resetWord();
  });

  function addLetterToWord(letter) {
    word += letter;

    $('#current-word').text(word);
  }

  function removeLetterFromWord() {
    word = word.slice(0, -1);

    $('#current-word').text(word);
  }

  function resetWord() {
    word = "";
    selectedSquares = [];
    $('#current-word').text("");
    $('td').removeClass('clicked');
  }
});