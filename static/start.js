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
      $('#grid tr:last').append("<td class='gridSquare' id='g"+ row + "#" + column + "' data-row='" + row + "' data-column='" + column + "'>" + randomLetter() + "</td>")
    }
  }

  var word = "";
  var lastClickedId = null;

  $('.gridSquare').click(function () {
    let element = $(this);
    updateWord(element);

    if (element.hasClass('clicked')) {
      if (element.attr('id') !== lastClickedId) {
        resetWord()
      }
      element.removeClass('clicked');
    } else {
      element.addClass('clicked');
      lastClickedId = element.attr('id');
    }
  })

  function updateWord(element) {
    let letter = element.text().trim();

    word += letter;

    $('#current-word').text(word);
  }

  function resetWord() {
    word = "";
    wordSquares = [];
    $('#current-word').text("");
    $('td').removeClass('clicked');
  }
});