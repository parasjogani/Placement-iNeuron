import React, { Component } from 'react';
import "../App.css"

class TicTacToe extends Component {
    constructor(props) {
        super(props);
        this.state = {
            board: Array(9).fill(''),
            currentPlayer: 'X',
            winner: null
        };
    }

    handleClick(index) {
        if (this.state.board[index] === '' && !this.state.winner) {
            const newBoard = [...this.state.board];
            newBoard[index] = this.state.currentPlayer;
            this.setState(
                {
                    board: newBoard,
                    currentPlayer: this.state.currentPlayer === 'X' ? 'O' : 'X'
                },
                () => {
                    this.checkWinner();
                }
            );
        }
    }

    checkWinner() {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            const board = this.state.board;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.setState({
                    winner: board[a]
                });
                break;
            }
        }
    }

    render() {
        return (
            <div>
                <h1>Tic Tac Toe</h1>
                <div className="board">
                    {this.state.board.map((cell, index) => (
                        <div
                            key={index}
                            className={`cell ${cell}`}
                            onClick={() => this.handleClick(index)}
                        >
                            {cell}
                        </div>
                    ))}
                </div>
                {this.state.winner && <h2>Winner: {this.state.winner}</h2>}
            </div>
        );
    }
}

export default TicTacToe;
