import random

distribution = [9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1]
letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
           'V', 'W', 'X', 'Y', 'Z']

distribution_letters = [letter for ls in [[letter] * count for (letter, count) in zip(letters, distribution)] for letter in ls]


def random_letter():
    return distribution_letters[random.randrange(len(distribution_letters))]


def print_grid(grid, width):
    for i in range(len(grid)):
        print(grid[i], end='')
        if i % width == width - 1:
            print()


def letter_indices(code, width):
    column = int(code[0])
    row = int(code[1])
    moves = [int(move) for move in code[2:]]

    index = row * width + column

    indices = [index]

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
        indices.append(index)

    return indices


def move_grid(grid, indices, width, height):
    # find blanks
    for index in indices:
        grid[index] = '_'

    # drop letters to bottom of column
    columns = [grid[i::width] for i in range(width)]

    new_columns = []
    for column in columns:
        filtered_column = list(filter(lambda l: l is not '_', column))
        filtered_column_length = len(filtered_column)
        new_column = [random_letter() for _ in range(height - filtered_column_length)]
        new_column.extend(filtered_column)
        new_columns.append(new_column)

    print(columns)
    print(new_columns)

    new_grid = []
    for j in range(height):
        for i in range(width):
            new_grid.append(new_columns[i][j])

    return new_grid


dimensions = (6, 7)
grid = [random_letter() for i in range(dimensions[0] * dimensions[1])]

while True:
    print_grid(grid, dimensions[0])

    raw_code = input('Enter "word": ')
    code = [c for c in raw_code]
    indices = letter_indices(code, dimensions[0])
    word = "".join([grid[index] for index in indices])

    print(f'\n\nYou entered: {word}\n\n')

    grid = move_grid(grid, indices, dimensions[0], dimensions[1])