
function GameBoard() {
    const rows = 3;
    const cols = 3;
    const board = []

    for (let i=0; i<rows; i++) {
        board[i] = [];
        for (let j=0; j<cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const placeToken = (row, column, marker) => {
        return board[row][column].addToken(marker)
    }

    const checkWinner = (row, column, marker) => {
        let scoringBoard = board.map((row) => row.map((cell) => {
            let value = cell.getValue()===marker ? 1: 0;
            return value;
        }))
        console.log(scoringBoard)
        // Check horizontal
        if (scoringBoard[row].reduce((partialSum, a) => partialSum + a, 0)==3) {
            return true
        }
        // Check vertical
        if (scoringBoard[0][column]+scoringBoard[1][column]+scoringBoard[2][column]==3) {
            return true
        }

        // Check diagonals

        if (scoringBoard[0][0]+scoringBoard[1][1]+scoringBoard[2][2]==3) {
            return true
        }
        if (scoringBoard[0][2]+scoringBoard[1][1]+scoringBoard[2][0]==3) {
            return true
        }

        return false
    }

    const printBoard = () => {
        let printableBoard = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(printableBoard)
    }

    const resetBoard = () => {
        for (let i=0; i<rows; i++) {
            for (let j=0; j<cols; j++) {
                board[i][j].resetToken()
            }
        }
    }

    return {getBoard, placeToken, printBoard, checkWinner, resetBoard}
}


function Cell() {
    let value = 0;

    const addToken = (marker) => {
        if (value===0) {
            value = marker
            return true
        } else {
            return false
        }
        // value = value === 0 ? marker: value;
    };

    const resetToken = () => {
        value = 0;
    }

    const getValue = () => value;

    return {addToken, getValue, resetToken};
}

function newPlayer(number, marker) {
    let totalTokens = 0;
    let name = "Player " + String(number)

    const addToken = () => totalTokens++;
    const getTokens = () => totalTokens;
    const zeroTokens = () => {
        totalTokens = 0;
    }
    return {number, marker, name, addToken, getTokens, zeroTokens}
}


function GameController() {
    const gameBoard = GameBoard()

    playerOne = newPlayer(1, "X");
    playerTwo = newPlayer(2, "O");

    let isWinner = false

    currentPlayer = playerOne

    const getGameStatus = () => isWinner;

    const switchPlayer = () => {
        currentPlayer = currentPlayer === playerOne ? playerTwo: playerOne;
    }

    const getActivePlayer = () => currentPlayer;

    const updatePlayerName = (number, name) => {
        if (number === 1) {
            playerOne.name = name
        } else if (number === 2) {
            playerTwo.name = name
        }
    }

    const printNewRound = () => {
        gameBoard.printBoard();
        console.log(`${getActivePlayer().name}'s turn`);
    }

    const playRound = (row, column) => {
        let status = gameBoard.placeToken(row, column, getActivePlayer().marker)
        if (status) {
            getActivePlayer().addToken()

            if (getActivePlayer().getTokens() > 2) {
                isWinner = gameBoard.checkWinner(row, column, getActivePlayer().marker)
            }
    
            if (isWinner) {
                console.log(`The winner is ${getActivePlayer().name}`)
            } else if (playerOne.getTokens()+playerTwo.getTokens()>=9) {
                console.log("The game is a tie!")
            } else {
                switchPlayer()
                printNewRound()
            }
        }
    }

    const resetGame = () => {
        gameBoard.resetBoard();
        isWinner = false;
        playerOne.zeroTokens();
        playerTwo.zeroTokens();
        currentPlayer = playerOne
        printNewRound()
    }

    const getBoardTokens = () => {
        return playerOne.getTokens()+playerTwo.getTokens()
    }

    printNewRound()

    return {playRound, getActivePlayer,updatePlayerName, resetGame, getBoard: gameBoard.getBoard, getGameStatus, getBoardTokens}
}

function ScreenController() {
    const game = GameController()
    const playerTurnDiv = document.querySelector('.playerTurn')
    const boardDiv = document.querySelector('.board')
    const reset = document.querySelector('.reset')
    const form = document.querySelector('form')

    form.addEventListener("submit", (event) => {
        const data = new FormData(form)
        let i = 1;
        for (const entry of data) {
            if (entry[1]) {
                game.updatePlayerName(i, entry[1])
            }
            i++;
        }
        updateScreen()
        event.preventDefault();
      }, false,)

    const resetScreen = () => {
        game.resetGame()
        updateScreen()
    }

    reset.addEventListener('click', () => resetScreen())

    const updateScreen = () => {
        boardDiv.textContent = "";

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();


        if (game.getGameStatus()) {
            playerTurnDiv.textContent = `${activePlayer.name} is Winner!`
        } else if (game.getBoardTokens()===9) {
            playerTurnDiv.textContent = `Game is a tie!`
        } else {
            playerTurnDiv.textContent = `${activePlayer.name}'s turn...`
        }
        

        // Render board squares
        board.forEach((row, rIndex) => {
        row.forEach((cell, cIndex) => {
          // Anything clickable should be a button!!
          const cellButton = document.createElement("button");
          cellButton.classList.add("cell");
          // Create a data attribute to identify the column
          // This makes it easier to pass into our `playRound` function 
          cellButton.dataset.row = rIndex;
          cellButton.dataset.column = cIndex
          cellButton.textContent = cell.getValue()===0 ? "": cell.getValue();
          boardDiv.appendChild(cellButton);
        })
      })
    }

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const selectedRow = e.target.dataset.row;
        // Make sure I've clicked a column and not the gaps in between
        if (!selectedColumn) return;
        if (!selectedRow) return;

        console.log(`Row:${selectedRow}, Column:${selectedColumn}`)
        
        if (!game.getGameStatus()) {
            game.playRound(selectedRow, selectedColumn);
            updateScreen();
        }
    }
    boardDiv.addEventListener("click", clickHandlerBoard);

    updateScreen()
}


ScreenController()