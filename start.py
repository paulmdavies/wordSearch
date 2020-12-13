from flask import Flask, render_template
import random

app = Flask(__name__)

DIMENSION = 5
DISTRIBUTION = [9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1]
LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
           'V', 'W', 'X', 'Y', 'Z']

DISTRIBUTION_LETTERS = [letter for ls in [[letter] * count for (letter, count) in zip(LETTERS, DISTRIBUTION)] for letter in ls]


@app.route('/')
def wordsearch():
    return render_template("start.html")


def random_letter():
    return DISTRIBUTION_LETTERS[random.randrange(len(DISTRIBUTION_LETTERS))]


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
