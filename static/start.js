$(document).ready(function () {
  const AVAILABLE_LETTERS = 500;
  const DIMENSION = 7;
  const GAME_SECONDS = 150;
  const EXPIRING_SECONDS = 30;
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

  new Date(GAME_SECONDS);
  $('#timer').text((GAME_SECONDS / 60 | 0) + ":" + (GAME_SECONDS % 60).toString().padStart(2, '0'))

  let validWords = [];
  fetch("../static/filtered_wordlist.txt")
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

  var columns = [];
  let storedGame = Cookies.get('stored-game');
  if (storedGame === undefined) {
    for (let columnIndex = 0; columnIndex < DIMENSION; columnIndex++) {
      column = [];
      for (let rowIndex = 0; rowIndex < AVAILABLE_LETTERS; rowIndex++) {
        column.push(randomLetter());
      }
      columns.push(column);
    }
    let columnsString = columns.map(column => column.join('')).join('#');
    Cookies.set('stored-game', columnsString, { expires: 365 });
  } else {
    columns = storedGame.split('#').map(column => column.split(''));
  }

  drawGrid(columns);

  $('#restart-game').click(_ => {
    location.reload();
  })

  $('#new-game').click(_ => {
    if (window.confirm("Are you sure? You'll not be able to get back to this game.")) {
      Cookies.remove('stored-game');
      Cookies.remove('game-highscore');
      location.reload();
    }
  })

  var word = "";
  var selectedSquares = [];
  var timerStarted = false;
  var currentScore = 0;
  var allTimeHighScore = Cookies.get('highscore')
  var gameHighScore = Cookies.get('game-highscore')

  if (allTimeHighScore !== undefined) {
    $('#all-time-highscore').text(allTimeHighScore);
  }

  if (gameHighScore !== undefined) {
    $('#highscore').text(gameHighScore);
  }

  function randomLetter() {
    let index = Math.floor(Math.random() * DISTRIBUTION_LETTERS.length);
    return DISTRIBUTION_LETTERS[index]
  }

  function goodMoveEvent(element, eventPageX, eventPageY) {
    let target = element;
    let targetLeft = target.offset().left;
    let targetTop = target.offset().top;
    let eventLeft = eventPageX;
    let eventTop = eventPageY;

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

  function press(event) {
    if (!timerStarted) {
      $('#timer').countdown(
        new Date().getTime() + (1000 * GAME_SECONDS),
        function (event) {
          $('#timer').text(event.strftime('%M:%S'))
          if (event.type === 'update' && parseInt(event.strftime('%T')) <= EXPIRING_SECONDS) {
            $('#timer').addClass('expiring')
          }
          if (event.type === 'finish') {
            resetWord();
            $('.gridSquare').off('mousedown mouseup mousemove touchstart touchend touchdrag')
            if (gameHighScore === undefined || currentScore > parseInt(gameHighScore)) {
              console.log("New game high score: " + parseInt(currentScore))
              $('#highscore').text(currentScore);
              Cookies.set('game-highscore', currentScore, { expires: 365 })
            }
            if (allTimeHighScore === undefined || currentScore > parseInt(allTimeHighScore)) {
              console.log("New all time high score: " + parseInt(currentScore))
              $('#all-time-highscore').text(currentScore);
              Cookies.set('highscore', currentScore, { expires: 365 })
            }
          }
        }
      )
      timerStarted = true;
    }
    let target = $(event.target);
    clickSquare(target)
  }

  function drag(event) {
    let target = $(event.target);
    let targetId = target.attr('id');

    let previousSquare = selectedSquares[selectedSquares.length - 1];
    if (previousSquare !== undefined && targetId !== previousSquare.attr('id') && goodMoveEvent(target, event.pageX, event.pageY)) {
      clickSquare(target)
    }
  }

  function touchDrag(event) {
    let touches = event.touches;
    let touch = touches[0];

    let target = $(document.elementFromPoint(touch.pageX, touch.pageY))
    let targetId = target.attr('id');

    let previousSquare = selectedSquares[selectedSquares.length - 1];
    if (previousSquare !== undefined && targetId !== previousSquare.attr('id') && goodMoveEvent(target, touch.pageX, touch.pageY)) {
      clickSquare(target)
    }
  }

  function drawGrid(columns) {
    let grid = $('#grid');
    grid.empty();
    for (var yIndex = DIMENSION - 1; yIndex >= 0; yIndex--) {
      grid.append('<tr></tr>');
      for (var xIndex = 0; xIndex < DIMENSION; xIndex++) {
        $('#grid tr:last').append("<td class='gridSquare' id='g" + yIndex + "#" + xIndex + "' data-y-index='" + yIndex + "' data-x-index='" + xIndex + "'>" + columns[xIndex][yIndex] + "</td>")
      }
    }
    $('.gridSquare').on('mousedown touchstart', press)
    $('.gridSquare').on('mousemove', drag)
    $('.gridSquare').on('touchmove', touchDrag)
    $('.gridSquare').on('mouseup touchend', submitWord)
  }

  function clickSquare(element) {
    if (element.hasClass('clicked')) {
      let removalSquare = selectedSquares.pop();
      let backtrackSquare = selectedSquares[selectedSquares.length-1];
      if (element.attr('id') !== backtrackSquare.attr('id')) {
        resetWord()
      } else {
        removeLetterFromWord()
        removalSquare.removeClass('clicked');
      }
    } else {
      let previousSelectedSquare = selectedSquares.pop();

      if (previousSelectedSquare) {
        let previousRow = previousSelectedSquare.attr('data-y-index');
        let previousColumn = previousSelectedSquare.attr('data-x-index');
        let row = element.attr('data-y-index');
        let column = element.attr('data-x-index');
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
    let multiplier = word.length - 2
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
          let column = selectedSquare.attr('data-x-index');
          if (column == columnIndex) {
            rowIndices.push(selectedSquare.attr('data-y-index'))
          }
        }
      });
      rowIndices.sort().reverse().forEach(function (rowIndex) {
        columns[columnIndex].splice(rowIndex, 1)
      })
    }
    drawGrid(columns);
    resetWord();
  }
});