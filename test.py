import random

distribution = [9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1]
letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
           'V', 'W', 'X', 'Y', 'Z']

distribution_letters = [letter for ls in [[letter] * count for (letter, count) in zip(letters, distribution)] for letter in ls]

def random_letter():
    return distribution_letters[random.randrange(len(distribution_letters))]


def print_grid(grid, dimensions):
    width = dimensions[0]
    for i in range(len(grid)):
        print(grid[i], end='')
        if i % width == width - 1:
            print()


def word_from_grid(grid, code, dimensions):
    width = dimensions[0]

    column = int(code[0])
    row = int(code[1])
    moves = [int(move) for move in code[2:]]

    index = row * width + column
    letters = [grid[index]]

    for move in moves:
        if move == 4:
            index -= 1
        elif move == 6:
            index += 1
        elif move == 8:
            index -= width
        elif move == 2:
            index += width
        elif move == 7:
            index -= width + 1
        elif move == 9:
            index -= width - 1
        elif move == 1:
            index += width - 1
        elif move == 3:
            index += width + 1
        letters.append(grid[index])

    return ''.join(letters)


dimensions = (6, 7)
grid = [random_letter() for i in range(dimensions[0] * dimensions[1])]

while True:
    print_grid(grid, dimensions)

    raw_code = input('Enter "word": ')
    code = [c for c in raw_code]
    print(word_from_grid(grid, code, dimensions))