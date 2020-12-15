$(document).ready(function () {
  let validWords = [];
  fetch("https://raw.githubusercontent.com/marcoagpinto/aoo-mozilla-en-dict/master/en_GB%20(Marco%20Pinto)/en-GB.dic")
    .then(response => response.text())
    .then(data => {
      let allWords = data.split("\n");
      allWords.forEach(rawWord => {
        // don't include proper nouns
        if (rawWord.length > 0 && rawWord[0] !== rawWord[0].toUpperCase()) {
          let sanitisedWord = rawWord.split('/')[0];
          if (sanitisedWord.length >= 3) {
            validWords.push(sanitisedWord)
          }
        }
      });
    })

  const DIMENSION = 7;

  const DISTRIBUTION = [9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1]
  const LETTERS = {
    'A': 1,
    'B': 3,
    'C': 3,
    'D': 2,
    'E': 1,
    'F': 4,
    'G': 2,
    'H': 4,
    'I': 1,
    'J': 8,
    'K': 5,
    'L': 1,
    'M': 3,
    'N': 1,
    'O': 1,
    'P': 3,
    'Q': 10,
    'R': 1,
    'S': 1,
    'T': 1,
    'U': 1,
    'V': 4,
    'W': 4,
    'X': 8,
    'Y': 4,
    'Z': 10
  }
  const DISTRIBUTION_LETTERS = [];

  for (var letter_index = 0; letter_index < Object.keys(LETTERS).length; letter_index++) {
    const letter = Object.keys(LETTERS)[letter_index];
    for (var count = 0; count < DISTRIBUTION[letter_index]; count++) {
      DISTRIBUTION_LETTERS.push(letter)
    }
  }

  function randomLetter() {
    let index = Math.floor(Math.random() * DISTRIBUTION_LETTERS.length);
    return DISTRIBUTION_LETTERS[index]
  }

  function goodMoveEvent(event) {
    let target = $(event.target);
    let targetLeft = target.offset().left;
    let targetTop = target.offset().top;
    let eventLeft = event.pageX;
    let eventTop = event.pageY;

    let targetWidth = target.width();
    let targetHeight = target.height();

    let halfTargetWidth = targetWidth / 2;
    let halfTargetHeight = targetHeight / 2;
    let targetXCentre = targetLeft + halfTargetWidth;
    let targetYCentre = targetTop + halfTargetHeight;

    let targetXLower = targetXCentre - (halfTargetWidth * 0.8)
    let targetXUpper = targetXCentre + (halfTargetWidth * 0.8)
    let targetYLower = targetYCentre - (halfTargetHeight * 0.8)
    let targetYUpper = targetYCentre + (halfTargetHeight * 0.8)

    return ((eventLeft >= targetXLower && eventLeft <= targetXUpper) && (eventTop >= targetYLower && eventTop <= targetYUpper))
  }

  function drawGrid(columns) {
    let grid = $('#grid');
    grid.empty();
    for (var rowIndex = 0; rowIndex < DIMENSION; rowIndex++) {
      grid.append('<tr></tr>');
      for (var columnIndex = 0; columnIndex < DIMENSION; columnIndex++) {
        $('#grid tr:last').append("<td class='gridSquare' id='g" + rowIndex + "#" + columnIndex + "' data-row='" + rowIndex + "' data-column='" + columnIndex + "'>" + columns[columnIndex][rowIndex] + "</td>")
      }
    }
    $('.gridSquare').mousedown(event => {
      if (event.buttons === 1) {
        if (!timerStarted) {
          $('#timer').countdown(
            new Date().getTime() + (1000 * 60 * 2),
            function (event) {
              $('#timer').text(event.strftime('%M:%S'))
              if (event.type === 'finish') {
                resetWord();
                $('.gridSquare').off('mousedown mouseup mousemove')
                if (highScore === undefined || currentScore > parseInt(highScore)) {
                  console.log("New high score: " + parseInt(currentScore))
                  $('#highscore').text(currentScore);
                  Cookies.set('highscore', currentScore)
                }
              }
            }
          )
          timerStarted = true;
        }
        let target = $(event.target);
        clickSquare(target)
      }
    })
    $('.gridSquare').mousemove(event => {
      if (event.buttons === 1) {
        let target = $(event.target);

        let targetId = target.attr('id');
        let previousSquare = selectedSquares[selectedSquares.length - 1];
        if (previousSquare !== undefined && targetId !== previousSquare.attr('id') && goodMoveEvent(event)) {
          clickSquare(target)
        }
      }
    })
    $('.gridSquare').mouseup(submitWord)
  }

  columns = [];
  for (let columnIndex = 0; columnIndex < DIMENSION; columnIndex++) {
    column = [];
    for (let rowIndex = 0; rowIndex < DIMENSION; rowIndex++) {
      column.push(randomLetter());
    }
    columns.push(column);
  }

  drawGrid(columns);

  var word = "";
  var selectedSquares = [];
  var timerStarted = false;
  var currentScore = 0;
  var highScore = Cookies.get('highscore')

  if (highScore !== undefined) {
    $('#highscore').text(highScore);
  }

  function clickSquare(element) {
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
  }

  function getWordScore(word) {
    let multiplier = 1 + ((word.length - 3) * 0.2)
    let score = 0;

    for (let letter of word) {
      score += LETTERS[letter];
    }

    return Math.round(score * multiplier)
  }

  function submitWord() {
    if (validWords.includes(word.toLowerCase())) {
      let scoreElement = $('#score');
      let wordScore = getWordScore(word);
      currentScore = parseInt(scoreElement.text()) + wordScore;

      $('#found-words-body').append("<tr><td>" + word + "</td><td>" + wordScore + "</td></tr>")

      scoreElement.text(currentScore);

      updateGrid();
    }
    resetWord();
  }

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

  function updateGrid() {
    for (let columnIndex = 0; columnIndex < DIMENSION; columnIndex++) {
      // find clicked squares in this column
      let rowIndices = [];
      selectedSquares.forEach(function (selectedSquare) {
        if (selectedSquare !== undefined) {
          let column = selectedSquare.attr('data-column');
          if (column == columnIndex) {
            rowIndices.push(selectedSquare.attr('data-row'))
          }
        }
      });
      if (rowIndices.length !== 0) {
        let reversedRowIndices = rowIndices.sort().reverse();
        rowIndices.forEach(function (rowIndex) {
          columns[columnIndex].splice(rowIndex, 1)
        })
        for (let i = 0; i < rowIndices.length; i++) {
          columns[columnIndex].unshift(randomLetter());
        }
      }
    }
    drawGrid(columns);
    resetWord();
  }
});