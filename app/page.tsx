'use client'
import { useEffect, useRef, useState } from 'react'

type ConversationMessage = { role: 'user' | 'assistant'; content: string }

function TicTacToe({ onClose, aiMode = false, onGameEnd }: { onClose: () => void; aiMode?: boolean; onGameEnd?: (result: 'user' | 'ai' | 'draw') => void }) {
	const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
	const [xIsNext, setXIsNext] = useState(true)
	const [winner, setWinner] = useState<string | null>(null)
	const [isAiThinking, setIsAiThinking] = useState(false)

	const calculateWinner = (squares: (string | null)[]) => {
		const lines = [
			[0,1,2],[3,4,5],[6,7,8],
			[0,3,6],[1,4,7],[2,5,8],
			[0,4,8],[2,4,6]
		]
		for (const [a,b,c] of lines) {
			if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a]
		}
		if (squares.every(Boolean)) return 'Draw'
		return null
	}

	const getAiMove = (squares: (string | null)[]): number => {
		// AI plays as 'O', user is 'X'
		
		// Check if AI can win
		for (let i = 0; i < 9; i++) {
			if (!squares[i]) {
				const testBoard = squares.slice()
				testBoard[i] = 'O'
				if (calculateWinner(testBoard) === 'O') return i
			}
		}
		
		// Check if AI needs to block user from winning
		for (let i = 0; i < 9; i++) {
			if (!squares[i]) {
				const testBoard = squares.slice()
				testBoard[i] = 'X'
				if (calculateWinner(testBoard) === 'X') return i
			}
		}
		
		// Take center if available
		if (!squares[4]) return 4
		
		// Take corners
		const corners = [0, 2, 6, 8]
		const availableCorners = corners.filter(i => !squares[i])
		if (availableCorners.length > 0) {
			return availableCorners[Math.floor(Math.random() * availableCorners.length)]
		}
		
		// Take any remaining spot
		const available = squares.map((spot, i) => spot === null ? i : null).filter(i => i !== null) as number[]
		return available[Math.floor(Math.random() * available.length)]
	}

	const handleClick = (i: number) => {
		if (board[i] || winner) return
		
		// In AI mode, user is always X and goes first
		if (aiMode && !xIsNext) return // Don't allow clicking during AI's turn
		
		const next = board.slice()
		next[i] = xIsNext ? 'X' : 'O'
		setBoard(next)
		const w = calculateWinner(next)
		if (w) {
			setWinner(w)
			// Trigger game end callback for AI mode
			if (aiMode && onGameEnd) {
				setTimeout(() => {
					if (w === 'Draw') onGameEnd('draw')
					else if (w === 'X') onGameEnd('user')
					else onGameEnd('ai')
				}, 1000) // Give a moment to see the result
			}
			return
		}
		
		if (aiMode && xIsNext) {
			// User just moved, now it's AI's turn
			setXIsNext(false)
			setIsAiThinking(true)
			
			// Add a small delay to make it feel more natural
			setTimeout(() => {
				const aiMove = getAiMove(next)
				if (aiMove !== undefined) {
					const aiBoard = next.slice()
					aiBoard[aiMove] = 'O'
					setBoard(aiBoard)
					const aiWinner = calculateWinner(aiBoard)
					if (aiWinner) {
						setWinner(aiWinner)
						// Trigger game end callback for AI mode
						if (onGameEnd) {
							setTimeout(() => {
								if (aiWinner === 'Draw') onGameEnd('draw')
								else if (aiWinner === 'X') onGameEnd('user')
								else onGameEnd('ai')
							}, 1000) // Give a moment to see the result
						}
					} else {
						setXIsNext(true)
					}
				}
				setIsAiThinking(false)
			}, 800 + Math.random() * 700) // Random delay between 0.8-1.5s
		} else {
			setXIsNext(!xIsNext)
		}
	}

	const reset = () => { 
		setBoard(Array(9).fill(null))
		setXIsNext(true)
		setWinner(null)
		setIsAiThinking(false)
	}

	const getStatusMessage = () => {
		if (winner) {
			if (winner === 'Draw') return "It's a draw!"
			if (aiMode) {
				return winner === 'X' ? "You win! 🎉" : "AI wins! 🤖"
			}
			return `${winner} wins!`
		}
		
		if (aiMode) {
			if (isAiThinking) return "AI is thinking... 🤔"
			return xIsNext ? "Your turn (X)" : "AI's turn (O)"
		}
		
		return `Turn: ${xIsNext ? 'X' : 'O'}`
	}

	return (
		<div className="modal-backdrop" role="dialog" aria-modal="true">
			<div className="tic-tac-toe-modal">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
					<h2 style={{ margin: 0 }}>Tic Tac Toe {aiMode && '🤖'}</h2>
					<div style={{ display: 'flex', gap: 8 }}>
						<button className="btn secondary" onClick={reset}>Reset</button>
						<button className="btn" onClick={onClose}>Close</button>
					</div>
				</div>
				<p style={{ marginTop: 0 }}>{getStatusMessage()}</p>
				<div className="tic-tac-toe-grid">
					{Array.from({ length: 9 }).map((_, i) => (
						<button 
							key={i} 
							className="tic-tac-toe-square" 
							onClick={() => handleClick(i)}
							disabled={aiMode && (!xIsNext || isAiThinking) && !winner}
							style={{ 
								opacity: (aiMode && (!xIsNext || isAiThinking) && !winner) ? 0.5 : 1,
								cursor: (aiMode && (!xIsNext || isAiThinking) && !winner) ? 'not-allowed' : 'pointer'
							}}
						>
							{board[i]}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

function Trivia({ onClose }: { onClose: () => void }) {
	const [questions, setQuestions] = useState<Array<{ question: string; correct_answer: string; incorrect_answers: string[] }>>([])
	const [index, setIndex] = useState(0)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
	const [showResults, setShowResults] = useState(false)
	const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				// Add timestamp to ensure fresh questions each time
				const timestamp = Date.now()
				const res = await fetch('/api/gemini-trivia', { 
					method: 'POST', 
					headers: { 'Content-Type': 'application/json' }, 
					body: JSON.stringify({ 
						age: 10, 
						subject: 'general', 
						difficulty: 'easy',
						timestamp // This ensures fresh questions each time
					}) 
				})
				const data = await res.json()
				setQuestions(data.questions || [])
			} catch {
				setMessage('Failed to load questions')
			} finally { setLoading(false) }
		}
		load()
	}, []) // Keep empty dependency array but timestamp ensures fresh data

	if (loading) return (
		<div className="modal-backdrop"><div className="modal-card">Loading questions...</div></div>
	)

	const current = questions[index]
	if (!current) return (
		<div className="modal-backdrop"><div className="modal-card"><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><h2 style={{ margin:0 }}>Trivia</h2><button className="btn" onClick={onClose}>Close</button></div><p>{message || 'No questions available.'}</p></div></div>
	)

	const answers = [...current.incorrect_answers, current.correct_answer].sort()
	
	const handleAnswer = (selectedAnswer: string) => {
		if (isProcessingAnswer) return // Prevent multiple clicks
		
		setSelectedAnswer(selectedAnswer)
		setShowResults(true)
		setIsProcessingAnswer(true)
		
		// Wait 2.5 seconds then move to next question
		setTimeout(() => {
			if (index < questions.length - 1) {
				setIndex(index + 1)
				setSelectedAnswer(null)
				setShowResults(false)
				setIsProcessingAnswer(false)
			} else {
				setMessage('Great job! You finished the quiz.')
				setIsProcessingAnswer(false)
			}
		}, 2500)
	}

	const getButtonStyle = (answer: string) => {
		if (!showResults) {
			return { }
		}
		
		const isCorrect = answer === current.correct_answer
		const isSelected = answer === selectedAnswer
		
		if (isCorrect) {
			return {
				backgroundColor: '#22c55e',
				color: 'white',
				border: '2px solid #16a34a'
			}
		} else if (isSelected) {
			return {
				backgroundColor: '#ef4444',
				color: 'white',
				border: '2px solid #dc2626'
			}
		}
		
		return {
			opacity: 0.5
		}
	}

	const getButtonIcon = (answer: string) => {
		if (!showResults) return ''
		
		const isCorrect = answer === current.correct_answer
		const isSelected = answer === selectedAnswer
		
		if (isCorrect) return ' ✓'
		if (isSelected) return ' ✗'
		return ''
	}

	return (
		<div className="modal-backdrop" role="dialog" aria-modal="true">
			<div className="modal-card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
					<h2 style={{ margin: 0 }}>Trivia</h2>
					<button className="btn" onClick={onClose}>Close</button>
				</div>
				<p style={{ marginTop: 0 }}>{current.question}</p>
				<div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 8 }}>
					{answers.map((a, i) => (
						<button 
							key={i} 
							className="btn secondary" 
							onClick={() => handleAnswer(a)}
							disabled={isProcessingAnswer}
							style={{
								...getButtonStyle(a),
								cursor: isProcessingAnswer ? 'not-allowed' : 'pointer',
								transition: 'all 0.3s ease'
							}}
						>
							{a}{getButtonIcon(a)}
						</button>
					))}
				</div>
				{message && <p>{message}</p>}
			</div>
		</div>
	)
}

function Sudoku({ onClose }: { onClose: () => void }) {
	// Sudoku game state
	const [board, setBoard] = useState<(number | null)[][]>(() => generateEmptyBoard())
	const [originalBoard, setOriginalBoard] = useState<(number | null)[][]>(() => generateEmptyBoard())
	const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null)
	const [mistakes, setMistakes] = useState(0)
	const [isComplete, setIsComplete] = useState(false)
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
	const [showCelebration, setShowCelebration] = useState(false)
	const [timeElapsed, setTimeElapsed] = useState(0)
	const [gameStarted, setGameStarted] = useState(false)

	// Timer effect
	useEffect(() => {
		if (!gameStarted || isComplete) return
		
		const timer = setInterval(() => {
			setTimeElapsed(prev => prev + 1)
		}, 1000)
		
		return () => clearInterval(timer)
	}, [gameStarted, isComplete])

	// Auto-start game on component mount
	useEffect(() => {
		startNewGame('easy')
	}, [])

	// Generate empty 9x9 board
	function generateEmptyBoard(): (number | null)[][] {
		return Array(9).fill(null).map(() => Array(9).fill(null))
	}

	// Check if a number is valid in the given position
	function isValidMove(board: (number | null)[][], row: number, col: number, num: number): boolean {
		// Check row
		for (let c = 0; c < 9; c++) {
			if (c !== col && board[row][c] === num) return false
		}
		
		// Check column
		for (let r = 0; r < 9; r++) {
			if (r !== row && board[r][col] === num) return false
		}
		
		// Check 3x3 box
		const boxRow = Math.floor(row / 3) * 3
		const boxCol = Math.floor(col / 3) * 3
		for (let r = boxRow; r < boxRow + 3; r++) {
			for (let c = boxCol; c < boxCol + 3; c++) {
				if ((r !== row || c !== col) && board[r][c] === num) return false
			}
		}
		
		return true
	}

	// Generate a complete valid Sudoku board
	function generateCompleteBoard(): (number | null)[][] {
		const board = generateEmptyBoard()
		fillBoard(board)
		return board
	}

	// Fill board using backtracking
	function fillBoard(board: (number | null)[][]): boolean {
		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				if (board[row][col] === null) {
					const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
					for (const num of numbers) {
						if (isValidMove(board, row, col, num)) {
							board[row][col] = num
							if (fillBoard(board)) return true
							board[row][col] = null
						}
					}
					return false
				}
			}
		}
		return true
	}

	// Generate puzzle by removing numbers from complete board
	function generatePuzzle(difficulty: 'easy' | 'medium' | 'hard'): { puzzle: (number | null)[][], solution: (number | null)[][] } {
		const solution = generateCompleteBoard()
		const puzzle = solution.map(row => [...row])
		
		// Number of cells to remove based on difficulty
		const cellsToRemove = {
			easy: 40,
			medium: 50,
			hard: 60
		}[difficulty]
		
		let removed = 0
		while (removed < cellsToRemove) {
			const row = Math.floor(Math.random() * 9)
			const col = Math.floor(Math.random() * 9)
			if (puzzle[row][col] !== null) {
				puzzle[row][col] = null
				removed++
			}
		}
		
		return { puzzle, solution }
	}

	// Start new game
	const startNewGame = (newDifficulty: 'easy' | 'medium' | 'hard' = difficulty) => {
		const { puzzle } = generatePuzzle(newDifficulty)
		setBoard(puzzle)
		setOriginalBoard(puzzle.map(row => [...row]))
		setSelectedCell(null)
		setMistakes(0)
		setIsComplete(false)
		setShowCelebration(false)
		setTimeElapsed(0)
		setGameStarted(true)
		setDifficulty(newDifficulty)
	}

	// Handle cell click
	const handleCellClick = (row: number, col: number) => {
		if (originalBoard[row][col] !== null) return // Can't select pre-filled cells
		setSelectedCell({ row, col })
	}

	// Handle number input
	const handleNumberInput = (num: number) => {
		if (!selectedCell || originalBoard[selectedCell.row][selectedCell.col] !== null) return
		
		const { row, col } = selectedCell
		const newBoard = board.map(row => [...row])
		
		if (newBoard[row][col] === num) {
			// Remove number if clicking the same number
			newBoard[row][col] = null
		} else {
			// Place number
			if (!isValidMove(newBoard, row, col, num)) {
				setMistakes(prev => prev + 1)
				// Still place the number but mark it as wrong
			}
			newBoard[row][col] = num
		}
		
		setBoard(newBoard)
		
		// Check if puzzle is complete
		const isComplete = newBoard.every(row => row.every(cell => cell !== null))
		if (isComplete) {
			setIsComplete(true)
			setGameStarted(false)
			setShowCelebration(true)
			setTimeout(() => setShowCelebration(false), 3000)
		}
	}

	// Format time
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	// Check if a cell has an error
	const hasError = (row: number, col: number): boolean => {
		const num = board[row][col]
		if (!num) return false
		
		// Temporarily remove the number and check if it's valid
		const tempBoard = board.map(r => [...r])
		tempBoard[row][col] = null
		return !isValidMove(tempBoard, row, col, num)
	}

	return (
		<div className="modal-backdrop" role="dialog" aria-modal="true">
			<div className="modal-card" style={{ width: 'min(95vw, 700px)', maxHeight: '85vh' }}>
				{/* Header */}
				<div style={{ 
					display: 'flex', 
					justifyContent: 'space-between', 
					alignItems: 'center', 
					marginBottom: 16
				}}>
					<h2 style={{ margin: 0, color: '#08AFC0' }}>Sudoku 🧩</h2>
					<button className="btn" onClick={onClose}>Close</button>
				</div>

				{/* Game stats */}
				<div style={{ 
					display: 'flex', 
					justifyContent: 'space-between', 
					marginBottom: 16,
					padding: '8px 12px',
					backgroundColor: 'rgba(8, 175, 192, 0.1)',
					borderRadius: '8px',
					border: '1px solid rgba(8, 175, 192, 0.3)'
				}}>
					<div style={{ color: '#08AFC0', fontWeight: 'bold' }}>
						⏱️ {formatTime(timeElapsed)}
					</div>
					<div style={{ color: '#08AFC0', fontWeight: 'bold', textTransform: 'capitalize' }}>
						🎯 {difficulty}
					</div>
					<div style={{ color: mistakes > 0 ? '#ff4444' : '#08AFC0', fontWeight: 'bold' }}>
						❌ {mistakes} mistakes
					</div>
				</div>

				{/* Main game area - side by side layout */}
				<div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
					{/* Sudoku grid */}
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(9, 1fr)', 
						gap: '1px',
						backgroundColor: '#08AFC0',
						border: '3px solid #08AFC0',
						borderRadius: '8px',
						aspectRatio: '1',
						width: '400px',
						maxWidth: '400px'
					}}>
						{board.map((row, rowIndex) =>
							row.map((cell, colIndex) => {
								const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
								const isOriginal = originalBoard[rowIndex][colIndex] !== null
								const hasErr = hasError(rowIndex, colIndex)
								const isInSameBox = selectedCell && 
									Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && 
									Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)
								const isInSameRowOrCol = selectedCell && 
									(selectedCell.row === rowIndex || selectedCell.col === colIndex)
								
								return (
									<div
										key={`${rowIndex}-${colIndex}`}
										onClick={() => handleCellClick(rowIndex, colIndex)}
										style={{
											aspectRatio: '1',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '18px',
											fontWeight: 'bold',
											cursor: isOriginal ? 'default' : 'pointer',
											backgroundColor: isSelected ? '#1a5a63' : '#2a2a2a',
											color: hasErr ? '#ff4444' : isOriginal ? '#08AFC0' : '#ffffff',
											borderRadius: '2px',
											border: isSelected ? '2px solid #08AFC0' : '1px solid #3a3a3a',
											transition: 'all 0.2s ease'
										}}
									>
										{cell || ''}
									</div>
								)
							})
						)}
					</div>

					{/* Right side controls */}
					<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
						{/* Number input buttons */}
						<div>
							<h3 style={{ margin: '0 0 8px 0', color: '#08AFC0', fontSize: '1rem' }}>Numbers:</h3>
							<div style={{ 
								display: 'grid', 
								gridTemplateColumns: 'repeat(3, 1fr)', 
								gap: 6
							}}>
								{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
									<button
										key={num}
										onClick={() => handleNumberInput(num)}
										disabled={!selectedCell || originalBoard[selectedCell.row][selectedCell.col] !== null}
										style={{
											padding: '8px',
											fontSize: '16px',
											fontWeight: 'bold',
											backgroundColor: selectedCell ? '#08AFC0' : 'rgba(8, 175, 192, 0.3)',
											color: selectedCell ? 'white' : '#08AFC0',
											border: '2px solid #08AFC0',
											borderRadius: '6px',
											cursor: selectedCell ? 'pointer' : 'not-allowed',
											opacity: selectedCell ? 1 : 0.5,
											transition: 'all 0.2s ease'
										}}
									>
										{num}
									</button>
								))}
							</div>
							<button
								onClick={() => {
									if (selectedCell && originalBoard[selectedCell.row][selectedCell.col] === null) {
										const newBoard = board.map(row => [...row])
										newBoard[selectedCell.row][selectedCell.col] = null
										setBoard(newBoard)
									}
								}}
								disabled={!selectedCell || originalBoard[selectedCell?.row][selectedCell?.col] !== null}
								style={{
									padding: '8px',
									fontSize: '14px',
									fontWeight: 'bold',
									backgroundColor: selectedCell ? '#ff4444' : 'rgba(255, 68, 68, 0.3)',
									color: 'white',
									border: '2px solid #ff4444',
									borderRadius: '6px',
									cursor: selectedCell ? 'pointer' : 'not-allowed',
									opacity: selectedCell ? 1 : 0.5,
									transition: 'all 0.2s ease',
									width: '100%',
									marginTop: '6px'
								}}
							>
								🗑️ Clear
							</button>
						</div>

						{/* Game controls */}
						<div>
							<h3 style={{ margin: '0 0 8px 0', color: '#08AFC0', fontSize: '1rem' }}>Difficulty:</h3>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
								<button 
									className="btn secondary" 
									onClick={() => startNewGame('easy')}
									style={{ 
										backgroundColor: difficulty === 'easy' ? '#08AFC0' : 'rgba(8, 175, 192, 0.2)',
										color: difficulty === 'easy' ? 'white' : '#08AFC0',
										border: '2px solid #08AFC0',
										padding: '8px 12px',
										fontSize: '14px'
									}}
								>
									🟢 Easy
								</button>
								<button 
									className="btn secondary" 
									onClick={() => startNewGame('medium')}
									style={{ 
										backgroundColor: difficulty === 'medium' ? '#08AFC0' : 'rgba(8, 175, 192, 0.2)',
										color: difficulty === 'medium' ? 'white' : '#08AFC0',
										border: '2px solid #08AFC0',
										padding: '8px 12px',
										fontSize: '14px'
									}}
								>
									🟡 Medium
								</button>
								<button 
									className="btn secondary" 
									onClick={() => startNewGame('hard')}
									style={{ 
										backgroundColor: difficulty === 'hard' ? '#08AFC0' : 'rgba(8, 175, 192, 0.2)',
										color: difficulty === 'hard' ? 'white' : '#08AFC0',
										border: '2px solid #08AFC0',
										padding: '8px 12px',
										fontSize: '14px'
									}}
								>
									🔴 Hard
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Celebration overlay */}
				{showCelebration && (
					<div style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 9999,
						animation: 'celebrationFade 3s ease-out'
					}}>
						<div style={{
							fontSize: '6rem',
							color: '#08AFC0',
							textShadow: '0 0 30px #08AFC0, 0 0 60px #08AFC0',
							animation: 'celebrationBounce 1s ease-out',
							marginBottom: '20px'
						}}>
							🎉
						</div>
						<div style={{
							fontSize: '2rem',
							fontWeight: 'bold',
							color: '#08AFC0',
							textShadow: '0 0 20px #08AFC0',
							marginBottom: '10px'
						}}>
							Puzzle Complete!
						</div>
						<div style={{
							fontSize: '1.2rem',
							color: '#08AFC0',
							opacity: 0.8
						}}>
							Time: {formatTime(timeElapsed)} • Mistakes: {mistakes}
						</div>
					</div>
				)}

				{/* Add celebration animations */}
				<style jsx>{`
					@keyframes celebrationFade {
						0% { opacity: 0; }
						10% { opacity: 1; }
						90% { opacity: 1; }
						100% { opacity: 0; }
					}
					
					@keyframes celebrationBounce {
						0% { 
							transform: scale(0) rotate(-180deg); 
							opacity: 0; 
						}
						50% { 
							transform: scale(1.2) rotate(0deg); 
							opacity: 1; 
						}
						100% { 
							transform: scale(1) rotate(0deg); 
							opacity: 1; 
						}
					}
				`}</style>
			</div>
		</div>
	)
}

export default function Home() {
	const [isSpeaking, setIsSpeaking] = useState(false)
	const [stars, setStars] = useState<{cx: number, cy: number, r: number, opacity: number}[]>([]);

	useEffect(() => {
	  const generatedStars = Array.from({ length: 150 }).map(() => ({
	    cx: Math.random() * 1200,
	    cy: Math.random() * 700,
	    r: Math.random() * 2 + 0.5,
	    opacity: Math.random() * 0.5 + 0.2,
	  }));
	  setStars(generatedStars);
	}, []);
	const [transcript, setTranscript] = useState('')
	const [mouthAnimation, setMouthAnimation] = useState(0)
	const [isProcessing, setIsProcessing] = useState(false)
	const [aiResponse, setAiResponse] = useState('')
	const [isListening, setIsListening] = useState(false)
	const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
	const [showTicTacToe, setShowTicTacToe] = useState(false)
	const [showTrivia, setShowTrivia] = useState(false)
	const [showSudoku, setShowSudoku] = useState(false)
	const [ticTacToeAiMode, setTicTacToeAiMode] = useState(false)
	const [pendingGameLaunch, setPendingGameLaunch] = useState<{ game: 'tictactoe' | 'trivia' | 'sudoku', aiMode: boolean } | null>(null)
	const [speechPermissionGranted, setSpeechPermissionGranted] = useState(false)
	const [voicesLoaded, setVoicesLoaded] = useState(false)

	const requestSpeechPermission = () => {
		setSpeechPermissionGranted(true)
	}

	// Function to manually reset all recognition flags
	const resetRecognitionFlags = () => {
		isStartingRef.current = false
		isStoppingRef.current = false
		shouldListenRef.current = true
		setIsListening(false)
		// Force a fresh start
		setTimeout(() => {
			if (canStartRecognition()) {
				startRecognition()
			}
		}, 1000)
	}

	// Function to reinitialize recognition if needed
	const reinitializeRecognition = () => {
		if (typeof window === 'undefined') return
		
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
		if (!SpeechRecognition) {
			return
		}
		
		// Clean up existing recognition
		if (recognitionRef.current) {
			try {
				recognitionRef.current.stop()
			} catch (e) {}
		}
		
		// Reset flags
		isStartingRef.current = false
		isStoppingRef.current = false
		setIsListening(false)
		
		// Create new recognition instance
		const recognition = new SpeechRecognition()
		recognition.continuous = true
		recognition.interimResults = true
		recognition.lang = 'en-US'
		
		// Set up event handlers (reuse the same logic from main useEffect)
		recognition.onstart = () => {
			setIsListening(true)
			isStartingRef.current = false
			finalTranscriptRef.current = ''
			setTranscript('')
		}
		
		recognition.onresult = (event: any) => {
			// Only process input if we're not speaking or processing
			if (isSpeaking || isProcessing) {
				return
			}

			let interim = ''
			let final = ''
			
			for (let i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					final += event.results[i][0].transcript
				} else {
					interim += event.results[i][0].transcript
				}
			}
			
			finalTranscriptRef.current = final
			setTranscript(final || interim)
			
			// Clear any existing silence timeout
			if (silenceTimeoutRef.current) {
				clearTimeout(silenceTimeoutRef.current)
			}
			
			// If we have interim results, wait for silence before processing
			if (interim.trim() && !final) {
				silenceTimeoutRef.current = setTimeout(() => {
					const current = finalTranscriptRef.current || interim
					if (current.trim() && !isProcessing && !isSpeaking) {
						handleSendToGemini(current)
					}
				}, 1000) // Wait 1 second of silence
			}
			
			// If we have final results, process immediately
			if (final.trim() && !isProcessing && !isSpeaking) {
				handleSendToGemini(final)
			}
		}
		
		recognition.onend = () => {

			setIsListening(false)
			isStartingRef.current = false
			isStoppingRef.current = false
			
			// Auto-restart if we should still be listening
			if (shouldListenRef.current && !isSpeaking && !isProcessing) {

				setTimeout(() => {
					if (canStartRecognition()) {
						startRecognition()
					}
				}, 2000)
			}
		}
		
		recognition.onerror = (event: any) => {

			setIsListening(false)
			isStartingRef.current = false
			isStoppingRef.current = false
			
			// Handle specific error types
			if (event.error === 'not-allowed') {

				return
			}
			
			// Restart on other errors if we should still be listening
			if (shouldListenRef.current && !isSpeaking && !isProcessing) {

				setTimeout(() => {
					if (canStartRecognition()) {
						startRecognition()
					}
				}, 3000) // Longer delay for error recovery
			}
		}
		
		recognitionRef.current = recognition
		
		// Start recognition if we should be listening
		if (shouldListenRef.current && !isProcessing && !isSpeaking) {
			setTimeout(() => {
				if (canStartRecognition()) {
					startRecognition()
				}
			}, 1000)
		}
	}

	// Function to check recognition state
	const checkRecognitionState = () => {
		const recognition = recognitionRef.current
		if (!recognition) {
			return
		}
		
		// State check logic without console output
	}

	// Simplified refs for voice recognition
	const recognitionRef = useRef<any>(null)
	const animationFrameRef = useRef<number | null>(null)
	const finalTranscriptRef = useRef('')
	const silenceTimeoutRef = useRef<any>(null)
	const restartTimeoutRef = useRef<any>(null)
	const shouldListenRef = useRef(true)
	const isStartingRef = useRef(false) // Track if we're in the process of starting
	const isStoppingRef = useRef(false) // Track if we're in the process of stopping
	const lastRestartAttemptRef = useRef(0) // Track last restart attempt to prevent rapid restarts

	// Helper function to check if recognition is in a valid state to start
	const canStartRecognition = () => {
		const recognition = recognitionRef.current
		if (!recognition) return false
		
		// Check if recognition is already in an active state
		try {
			// Try to access the state property if it exists
			const state = (recognition as any).state
			if (state && (state === 'recording' || state === 'starting')) {

				return false
			}
		} catch (e) {
			// If we can't check state, fall back to our flags
		}
		
		// Check cooldown period (minimum 2 seconds between restart attempts)
		const now = Date.now()
		if (now - lastRestartAttemptRef.current < 2000) {

			return false
		}
		
		return !isListening && !isStartingRef.current && shouldListenRef.current
	}

	// Simplified recognition start function
	const startRecognition = () => {
		const recognition = recognitionRef.current
		if (!recognition || !shouldListenRef.current) return
		
		// Use the helper function to check if we can start
		if (!canStartRecognition()) {

			return
		}
		
		isStartingRef.current = true
		lastRestartAttemptRef.current = Date.now() // Record restart attempt timestamp
		
		try {

			recognition.start()
		} catch (e) {

			isStartingRef.current = false
			
			// Handle specific error types
			if (e instanceof Error) {
				if (e.name === 'InvalidStateError') {

					// Force reset the recognition state and mark as listening to prevent loops
					try {
						recognition.stop()
						setIsListening(true) // Assume it's actually running
					} catch (stopError) {

					}
					// Don't retry immediately - let the onend/onerror handlers deal with it
				} else if (e.name === 'NotAllowedError') {

					// Don't retry for permission errors
				} else {

									// Retry other errors with longer delay
				setTimeout(() => {
					if (canStartRecognition()) {
						startRecognition()
					}
				}, 3000)
				}
							} else {

					setTimeout(() => {
						if (canStartRecognition()) {
							startRecognition()
						}
					}, 3000)
				}
		}
	}

	// Simplified recognition stop function
	const stopRecognition = () => {
		const recognition = recognitionRef.current
		if (!recognition) return
		
		// Prevent multiple simultaneous stop attempts
		if (!isListening || isStoppingRef.current) {

			return
		}
		
		isStoppingRef.current = true
		
		try {

			recognition.stop()
		} catch (e) {

			isStoppingRef.current = false
		}
	}

	// Load voices when component mounts
	useEffect(() => {
		if (typeof window === 'undefined') return
		
		const loadVoices = () => {
			const synth = window.speechSynthesis
			if (synth) {
				const voices = synth.getVoices()
				if (voices.length > 0) {
					setVoicesLoaded(true)
				} else {
					// Try again after a short delay
					setTimeout(loadVoices, 100)
				}
			}
		}
		
		loadVoices()
		
		// Also listen for voiceschanged event
		if (window.speechSynthesis) {
			window.speechSynthesis.onvoiceschanged = loadVoices
		}
		
		return () => {
			if (window.speechSynthesis) {
				window.speechSynthesis.onvoiceschanged = null
			}
		}
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return
		
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
		if (!SpeechRecognition) return
		
		const recognition = new SpeechRecognition()
		recognition.continuous = true
		recognition.interimResults = true
		recognition.lang = 'en-US'
		
		recognition.onstart = () => {

			setIsListening(true)
			isStartingRef.current = false // Reset starting flag
			finalTranscriptRef.current = ''
			setTranscript('')
		}
		
		recognition.onresult = (event: any) => {
			// Only process input if we're not speaking or processing
			if (isSpeaking || isProcessing) {
				return
			}

			let interim = ''
			let final = ''
			
			for (let i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					final += event.results[i][0].transcript
				} else {
					interim += event.results[i][0].transcript
				}
			}
			
			finalTranscriptRef.current = final
			setTranscript(final || interim)
			
			// Clear any existing silence timeout
			if (silenceTimeoutRef.current) {
				clearTimeout(silenceTimeoutRef.current)
			}
			
			// If we have interim results, wait for silence before processing
			if (interim.trim() && !final) {
				silenceTimeoutRef.current = setTimeout(() => {
					const current = finalTranscriptRef.current || interim
					if (current.trim() && !isProcessing && !isSpeaking) {
						handleSendToGemini(current)
					}
				}, 1000) // Wait 1 second of silence
			}
			
			// If we have final results, process immediately
			if (final.trim() && !isProcessing && !isSpeaking) {
				handleSendToGemini(final)
			}
		}
		
		recognition.onend = () => {

			setIsListening(false)
			isStartingRef.current = false // Reset starting flag
			isStoppingRef.current = false // Reset stopping flag
			
							// Auto-restart if we should still be listening, but with longer delay
				if (shouldListenRef.current && !isSpeaking && !isProcessing) {
	
					// Use a much longer delay to avoid rapid restart loops
					setTimeout(() => {
						if (canStartRecognition()) {
							startRecognition()
						}
					}, 2000)
				}
		}
		
		recognition.onerror = (event: any) => {

			setIsListening(false)
			isStartingRef.current = false // Reset starting flag
			isStoppingRef.current = false // Reset stopping flag
			
			// Handle specific error types
			if (event.error === 'not-allowed') {

				return
			}
			
			// Restart on other errors if we should still be listening, but with much longer delay
			if (shouldListenRef.current && !isSpeaking && !isProcessing) {

				setTimeout(() => {
					if (canStartRecognition()) {
						startRecognition()
					}
				}, 5000) // Much longer delay for error recovery to prevent loops
			}
		}
		
		recognitionRef.current = recognition
		
		// Start recognition immediately
		startRecognition()
		
		return () => {
			try {
				recognition.stop()
			} catch (e) {}
			// Reset all flags on cleanup
			isStartingRef.current = false
			isStoppingRef.current = false
			shouldListenRef.current = false
		}
	}, [])

	// Simplified effect to manage when recognition should be active
	useEffect(() => {
		shouldListenRef.current = !isProcessing && !isSpeaking
		

		
		if (shouldListenRef.current) {
			// Start recognition if it's not already running and not in the middle of starting/stopping
			if (!isListening && recognitionRef.current && !isStartingRef.current && !isStoppingRef.current) {

				setTimeout(() => {
					if (canStartRecognition()) {
						startRecognition()
					}
				}, 1000)
			}
		} else {
			// Stop recognition if it's running and not in the middle of stopping
			if (isListening && recognitionRef.current && !isStoppingRef.current) {
				stopRecognition()
			}
		}
	}, [isProcessing, isSpeaking, isListening])

	useEffect(() => {
		const animate = () => { setMouthAnimation(prev => (prev + 0.15) % (Math.PI * 2)); animationFrameRef.current = requestAnimationFrame(animate) }
		animationFrameRef.current = requestAnimationFrame(animate)
		return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) }
	}, [])

	// Speech synthesis monitor - cleans up stuck speech states
	useEffect(() => {
		const speechMonitor = setInterval(() => {
			if (typeof window !== 'undefined' && window.speechSynthesis) {
				// If we think we're speaking but synthesis says we're not, clean up
				if (isSpeaking && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {

					setIsSpeaking(false)
					setAiResponse('')
					if (!isProcessing && !isStartingRef.current) {
						setTimeout(() => {
							if (canStartRecognition()) {
								startRecognition()
							}
						}, 2000)
					}
				}
			}
		}, 2000) // Check every 2 seconds instead of 1 to reduce conflicts

		return () => clearInterval(speechMonitor)
	}, [isSpeaking, isProcessing])

	// Voice recognition health check - ensures it stays active
	useEffect(() => {
		const healthCheck = setInterval(() => {
			// Only restart if we should be listening, recognition isn't active, and we're not in the middle of starting/stopping
			if (shouldListenRef.current && 
				!isListening && 
				recognitionRef.current && 
				!isSpeaking && 
				!isProcessing && 
				!isStartingRef.current && 
				!isStoppingRef.current) {
				

				// Use a much longer delay to avoid conflicts with other restart attempts
				setTimeout(() => {
					if (canStartRecognition()) {
						startRecognition()
					}
				}, 3000)
			}
		}, 5000) // Check every 5 seconds instead of 3 to reduce conflicts

		return () => clearInterval(healthCheck)
	}, [isListening, isSpeaking, isProcessing])

	const handleGameEnd = (result: 'user' | 'ai' | 'draw') => {
		// Close the game modal
		setShowTicTacToe(false)
		
		// Generate AI response based on result
		let response = ''
		if (result === 'user') {
			const userWinResponses = [
				"Oh no! You got me! Great job! 🎉",
				"Wow, you're really good at this! I didn't see that coming!",
				"You win! I'll have to practice more to beat you next time! 😅",
				"Impressive! You outplayed me there!",
				"Nice moves! You really showed me how it's done! 👏"
			]
			response = userWinResponses[Math.floor(Math.random() * userWinResponses.length)]
		} else if (result === 'ai') {
			const aiWinResponses = [
				"I win this round! 🤖 Want to play again?",
				"Got you! That was a fun game!",
				"Victory is mine! You played well though!",
				"I managed to win that one! Good game!",
				"Success! But you're getting better each time!"
			]
			response = aiWinResponses[Math.floor(Math.random() * aiWinResponses.length)]
		} else {
			const drawResponses = [
				"It's a tie! We're both pretty good at this! 🤝",
				"A draw! Great minds think alike!",
				"Neither of us won that one - well played!",
				"It's a stalemate! We're evenly matched!",
				"A tie game! Want to try again for a tiebreaker?"
			]
			response = drawResponses[Math.floor(Math.random() * drawResponses.length)]
		}
		
		// Speak the AI response
		speakResponse(response)
	}

	const launchGame = (key: 'tictactoe' | 'trivia' | 'sudoku', aiMode: boolean = true) => {

		
		if (key === 'tictactoe') {

			setTicTacToeAiMode(aiMode)
			setShowTicTacToe(true)
		}
		if (key === 'trivia') {

			setShowTrivia(true);
		}
		if (key === 'sudoku') {

			setShowSudoku(true);
		}
	}

	const detectGameFromText = (raw: string): 'tictactoe' | 'trivia' | 'sudoku' | null => {
		const text = (raw || '').toLowerCase()
		// Normalize punctuation and spaces
		const cleaned = text.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
		

		
		// Common game-starting phrases
		const hasPlayVerb = /\b(let\s*us|lets|let's)?\s*(play|start|launch|open)\b|\b(can\s+we|should\s+we|want\s+to|time\s+to|time\s+for)\s+(play|start)\b|\bi\s+(want|wanna)\s+(to\s+)?(play|start)\b/.test(cleaned)
		
		// Tic Tac Toe synonyms - more comprehensive
		const ticTacPatterns = [
			/\btic\s*tac\s*toe\b/, /\btictactoe\b/, /\bxo\b/, /\bnoughts\s*and\s*crosses\b/,
			/\bx\s*and\s*o\b/, /\bx\s*o\b/, /\btic\s*tac\b/
		]
		if (ticTacPatterns.some(rx => rx.test(cleaned))) return 'tictactoe'
		
		// Trivia synonyms - more comprehensive  
		const triviaPatterns = [
			/\btrivia\b/, /\bquiz\b/, /\bquestion\s*game\b/, /\bquestions\b/,
			/\btrivial\s*pursuit\b/, /\bbrain\s*teaser\b/, /\bknowledge\s*test\b/
		]
		if (triviaPatterns.some(rx => rx.test(cleaned))) return 'trivia'
		
		// Sudoku synonyms
		const sudokuPatterns = [
			/\bsudoku\b/, /\bnumber\s*puzzle\b/, /\bnumber\s*game\b/, /\b9\s*by\s*9\b/,
			/\bnumbers\s*grid\b/, /\bpuzzle\s*grid\b/, /\bsuduko\b/, /\bsodoku\b/
		]
		if (sudokuPatterns.some(rx => rx.test(cleaned))) return 'sudoku'
		
		// Generic "play <game>" capture (supports single word names like trivia)
		if (hasPlayVerb) {
			const afterPlay = cleaned.match(/(?:play|open|start|launch|begin)\s+([a-z0-9\s]+)/)
			const candidate = (afterPlay?.[1] || '').trim()
			if (candidate) {
				if (ticTacPatterns.some(rx => rx.test(candidate))) return 'tictactoe'
				if (triviaPatterns.some(rx => rx.test(candidate))) return 'trivia'
				if (sudokuPatterns.some(rx => rx.test(candidate))) return 'sudoku'
			}
		}
		
		// Also catch standalone mentions in game context
		if (/\bgame\b/.test(cleaned)) {
			if (ticTacPatterns.some(rx => rx.test(cleaned))) return 'tictactoe'
			if (triviaPatterns.some(rx => rx.test(cleaned))) return 'trivia'
			if (sudokuPatterns.some(rx => rx.test(cleaned))) return 'sudoku'
		}
		
		return null
	}

	const handleSendToGemini = async (text: string) => {
		setIsProcessing(true)
		setTranscript('') // Clear transcript immediately
		finalTranscriptRef.current = ''
		const userMessage: ConversationMessage = { role: 'user', content: text }
		const updatedHistory = [...conversationHistory, userMessage]
		try {
			// Game intent detection for available games
			const detected = detectGameFromText(text)
			let pendingGame: { game: 'tictactoe' | 'trivia' | 'sudoku', aiMode: boolean } | null = null
			if (detected) {
				pendingGame = { game: detected, aiMode: true }
				setPendingGameLaunch(pendingGame)
			}

			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 10000)
			const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, conversationHistory: updatedHistory }), signal: controller.signal })
			clearTimeout(timeoutId)
			const data = await response.json().catch(() => null)
			if (!data || !data.response) throw new Error('AI failed')
			const aiMessage: ConversationMessage = { role: 'assistant', content: data.response }
			setConversationHistory([...updatedHistory, aiMessage])
			
			speakResponse(data.response, pendingGame)
		} catch (error) {

			speakResponse('Sorry, I had trouble understanding that.')
		} finally {
			setIsProcessing(false)
		}
	}

	const speakResponse = (text: string, pendingGame?: { game: 'tictactoe' | 'trivia' | 'sudoku', aiMode: boolean } | null) => {

		
		setIsSpeaking(true)
		setAiResponse(text)
		
		// Use the parameter if provided, otherwise use the state
		const gameToLaunch = pendingGame || pendingGameLaunch
		
		// Add an emergency fallback timer in case speech completely fails
		let emergencyLaunchTimer: NodeJS.Timeout | null = null
		if (gameToLaunch) {
			emergencyLaunchTimer = setTimeout(() => {

				if (gameToLaunch) {
					launchGame(gameToLaunch.game, gameToLaunch.aiMode)
					setPendingGameLaunch(null)
				}
				setIsSpeaking(false)
				setAiResponse('')
				if (!isProcessing && canStartRecognition()) startRecognition() // Restart recognition on emergency fallback
			}, 8000)
		}
		
		// Check if speech synthesis is available and enabled
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			if (speechPermissionGranted) {
				const synth = window.speechSynthesis

				
				// Aggressively cancel any ongoing speech
				try { 
					synth.cancel() 
					// Wait a bit for cancel to complete
					setTimeout(() => startSpeech(text, synth, gameToLaunch, emergencyLaunchTimer), 150)
				} catch (e) {

					startSpeech(text, synth, gameToLaunch, emergencyLaunchTimer)
				}
			} else {

				// Try anyway, maybe the state is wrong
				const synth = window.speechSynthesis
				try { 
					synth.cancel() 
					setTimeout(() => startSpeech(text, synth, gameToLaunch, emergencyLaunchTimer), 150)
				} catch (e) {
					console.error('Failed to start speech:', e)
					// Fall back to text display
					setTimeout(() => { 
						if (emergencyLaunchTimer) clearTimeout(emergencyLaunchTimer)
						setIsSpeaking(false) 
						setAiResponse('')
						
						// Launch pending game even if speech failed
						if (gameToLaunch) {
							console.log('🎮 Launching game after speech setup failure:', gameToLaunch.game)
							launchGame(gameToLaunch.game, gameToLaunch.aiMode)
							setPendingGameLaunch(null)
						}
						
						if (!isProcessing && canStartRecognition()) startRecognition() // Restart recognition on speech setup failure
					}, 4000)
				}
			}
		} else {
			console.warn('Speech synthesis not available, using text fallback')
			// Just show the text response without speech
			setTimeout(() => { 
				if (emergencyLaunchTimer) clearTimeout(emergencyLaunchTimer)
				setIsSpeaking(false) 
				setAiResponse('')
				
				// Launch pending game even without speech
				if (gameToLaunch) {
					console.log('🎮 Launching game without speech:', gameToLaunch.game)
					launchGame(gameToLaunch.game, gameToLaunch.aiMode)
					setPendingGameLaunch(null)
				}
				
				if (!isProcessing && canStartRecognition()) startRecognition() // Restart recognition on speech fallback
			}, 4000)
		}
	}

	// Helper function to get the best available voice
	const getBestVoice = (synth: SpeechSynthesis) => {
		// Ensure voices are loaded
		let voices = synth.getVoices()
		
		// If no voices available, try to load them
		if (voices.length === 0) {
			// Force voice loading by calling getVoices again
			voices = synth.getVoices()
			
			// If still no voices, return null
			if (voices.length === 0) {
				return null
			}
		}
		
		
		// Priority 1: Google English (US) female voice
		let preferredVoice = voices.find(voice => 
			voice.name.toLowerCase().includes('google') && 
			voice.lang.startsWith('en-US') && 
			voice.name.toLowerCase().includes('female')
		)
		
		// Priority 2: Any Google English (US) voice
		if (!preferredVoice) {
			preferredVoice = voices.find(voice => 
				voice.name.toLowerCase().includes('google') && 
				voice.lang.startsWith('en-US')
			)
		}
		
		// Priority 3: Any Google English voice
		if (!preferredVoice) {
			preferredVoice = voices.find(voice => 
				voice.name.toLowerCase().includes('google') && 
				voice.lang.startsWith('en')
			)
		}
		
		// Priority 4: Any English (US) female voice
		if (!preferredVoice) {
			preferredVoice = voices.find(voice => 
				voice.lang.startsWith('en-US') && 
				voice.name.toLowerCase().includes('female')
			)
		}
		
		// Priority 5: Any English (US) voice
		if (!preferredVoice) {
			preferredVoice = voices.find(voice => 
				voice.lang.startsWith('en-US')
			)
		}
		
		// Priority 6: Any English voice
		if (!preferredVoice) {
			preferredVoice = voices.find(voice => 
				voice.lang.startsWith('en')
			)
		}
		
		// Priority 7: Fallback to first available voice
		if (!preferredVoice) {
			preferredVoice = voices[0]
		}
		
		return preferredVoice
	}

	const startSpeech = (text: string, synth: SpeechSynthesis, pendingGame?: { game: 'tictactoe' | 'trivia' | 'sudoku', aiMode: boolean } | null, emergencyTimer?: NodeJS.Timeout | null) => {
		try {
			const utter = new SpeechSynthesisUtterance(text)
			utter.rate = 1.0
			utter.pitch = 1.3
			utter.volume = 1

			// Set up event handlers
			utter.onstart = () => {
				setIsSpeaking(true) // Ensure state is set
			}

			utter.onend = () => {
				if (emergencyTimer) clearTimeout(emergencyTimer)
				setIsSpeaking(false)
				setAiResponse('')
				
				// Launch pending game after speech ends
				if (pendingGame) {
					launchGame(pendingGame.game, pendingGame.aiMode)
					setPendingGameLaunch(null)
				}
				
				// Restart recognition after speech ends
				if (!isProcessing) {
					setTimeout(() => {
						if (canStartRecognition()) {
							startRecognition()
						}
					}, 1000)
				}
			}

			utter.onerror = (event) => {
				// Handle specific error types - note: TypeScript may not include all possible error types
				const errorType = event.error as string
				if (errorType === 'not-allowed' || errorType === 'authorization-failed') {
					setSpeechPermissionGranted(false)
					
					// Fall back to text display without speech
					if (emergencyTimer) clearTimeout(emergencyTimer)
					setIsSpeaking(false)
					setAiResponse(text)
					setTimeout(() => {
						setAiResponse('')
						
						// Launch pending game even if speech failed
						if (pendingGame) {
							launchGame(pendingGame.game, pendingGame.aiMode)
							setPendingGameLaunch(null)
						}
						
						if (!isProcessing) {
							setTimeout(() => {
								if (canStartRecognition()) {
									startRecognition()
								}
							}, 2000)
						}
					}, 4000)
					return
				}
				
				if (errorType === 'interrupted' || errorType === 'canceled') {
					if (emergencyTimer) clearTimeout(emergencyTimer)
					setIsSpeaking(false)
					setAiResponse('')
					
					// Launch pending game even if speech was interrupted
					if (pendingGame) {
						launchGame(pendingGame.game, pendingGame.aiMode)
						setPendingGameLaunch(null)
					}
					
					if (!isProcessing) {
						setTimeout(() => {
							if (canStartRecognition()) {
								startRecognition()
							}
						}, 1000)
					}
					return
				}
				
				// For other errors, try a fallback approach
				if (emergencyTimer) clearTimeout(emergencyTimer)
				setIsSpeaking(false)
				setAiResponse(text)
				setTimeout(() => {
					setAiResponse('')
					
					// Launch pending game even if speech had errors
					if (pendingGame) {
						launchGame(pendingGame.game, pendingGame.aiMode)
						setPendingGameLaunch(null)
					}
					
					if (!isProcessing) {
						setTimeout(() => {
							if (canStartRecognition()) {
								startRecognition()
							}
						}, 2000)
					}
				}, 3000)
			}

			// Try to resume synthesis in case it's paused
			try { synth.resume() } catch (e) {}
			
			// Get the best available voice
			const preferredVoice = getBestVoice(synth)
			if (preferredVoice) {
				utter.voice = preferredVoice
			}

			synth.speak(utter)

			// Fallback timeout in case speech fails silently
			const speechTimeout = setTimeout(() => {
				if (synth.speaking) {
					// Speech is still ongoing, let it continue
				} else {
					setIsSpeaking(false)
					setAiResponse('')
					
					// Launch pending game even if speech failed silently
					if (pendingGame) {
						launchGame(pendingGame.game, pendingGame.aiMode)
						setPendingGameLaunch(null)
					}
					
					if (!isProcessing) {
						setTimeout(() => {
							if (canStartRecognition()) {
								startRecognition()
							}
						}, 1000)
					}
				}
			}, Math.max(text.length * 100, 3000)) // Timeout based on text length, min 3 seconds

			// Clear timeout when speech ends
			const originalOnEnd = utter.onend
			utter.onend = (event) => {
				clearTimeout(speechTimeout)
				if (originalOnEnd) originalOnEnd.call(utter, event)
			}

		} catch (error) {
			// Disable speech on critical errors
			setSpeechPermissionGranted(false)
			setIsSpeaking(false)
			setAiResponse(text)
			setTimeout(() => {
				setAiResponse('')
				
				// Launch pending game even on critical speech errors
				if (pendingGame) {
					launchGame(pendingGame.game, pendingGame.aiMode)
					setPendingGameLaunch(null)
				}
				
				if (!isProcessing) {
					setTimeout(() => {
						if (canStartRecognition()) {
							startRecognition()
						}
					}, 1000)
				}
			}, 3000)
		}
	}

	const Mouth = () => {
		if (isSpeaking) {
			const baseRadius = 25
			const r = baseRadius + Math.sin(mouthAnimation * 6) * 15
			return (<circle cx="600" cy="500" r={r} fill="none" stroke="#08AFC0" strokeWidth="8" opacity={0.8 + Math.sin(mouthAnimation * 4) * 0.2} />)
		}
		return (<line x1="580" y1="500" x2="620" y2="500" stroke="#08AFC0" strokeWidth="6" strokeLinecap="round" />)
	}

	return (
		<>
			{!speechPermissionGranted && (
				<div className="modal-backdrop">
					<div className="permission-modal">
						<h2>Enable Microphone</h2>
						<p>This app uses your microphone to enable voice commands.</p>
						<button className="btn" onClick={requestSpeechPermission}>Enable Microphone</button>
					</div>
				</div>
			)}
			<div className="header-actions" />
			<main className="container">
				<div className="interface">
					<svg className="face" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<radialGradient id="galaxy-bg" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#2c003e" />
								<stop offset="100%" stopColor="#000000" />
							</radialGradient>
							<radialGradient id="eye-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
								<stop offset="0%" style={{ stopColor: 'rgb(0, 255, 127)', stopOpacity: 1 }} />
								<stop offset="100%" style={{ stopColor: 'rgb(0, 128, 0)', stopOpacity: 1 }} />
							</radialGradient>
							<filter id="blush-blur">
								<feGaussianBlur in="SourceGraphic" stdDeviation="10" />
							</filter>
						</defs>
						<rect width="1200" height="700" fill="url(#galaxy-bg)" />
						{stars.map((star, i) => (
							<circle key={i} cx={star.cx} cy={star.cy} r={star.r} fill="white" opacity={star.opacity} />
						))}
						<g>

							{/* Cheeks */}
							<ellipse cx="380" cy="450" rx="60" ry="25" fill="rgba(255, 105, 180, 0.4)" filter="url(#blush-blur)" />
							<ellipse cx="820" cy="450" rx="60" ry="25" fill="rgba(255, 105, 180, 0.4)" filter="url(#blush-blur)" />

							{/* Eyes */}
							<g className="blinking-eyes">
								<circle cx="400" cy="350" r="80" fill="url(#eye-gradient)" />
								<circle cx="400" cy="350" r="40" fill="#000" />
								<circle cx="420" cy="320" r="18" fill="#fff" />
								<circle cx="380" cy="380" r="9" fill="#fff" opacity="0.7" />
							</g>
							<g className="blinking-eyes">
								<circle cx="800" cy="350" r="80" fill="url(#eye-gradient)" />
								<circle cx="800" cy="350" r="40" fill="#000" />
								<circle cx="820" cy="320" r="18" fill="#fff" />
								<circle cx="780" cy="380" r="9" fill="#fff" opacity="0.7" />
							</g>

							{/* Mouth */}
							<path
								className={isSpeaking ? 'speaking-mouth' : ''}
								d="M520 550 Q600 600 680 550"
								stroke="#08AFC0"
								strokeWidth="8"
								fill="none"
								strokeLinecap="round"
							/>
						</g>
					</svg>
					{(aiResponse || transcript) && (
						<div className="subtitle">{aiResponse ? aiResponse : transcript}</div>
					)}
					{isProcessing && (
						<div className="processing"><div className="thinking-dots"><span>.</span><span>.</span><span>.</span></div>AI is thinking...</div>
					)}
					<div className="mic-status">
						{isSpeaking ? 'Speaking…' : (isProcessing ? 'Listening paused' : (isListening ? 'Listening…' : 'Microphone Idle'))}
					</div>

				</div>
			</main>
			{showTicTacToe && <TicTacToe onClose={() => {
				setShowTicTacToe(false);
				setPendingGameLaunch(null); // Clear pending game state
				setTranscript(''); // Clear any lingering voice commands
				finalTranscriptRef.current = ''; // Clear the ref too
			}} aiMode={ticTacToeAiMode} onGameEnd={ticTacToeAiMode ? handleGameEnd : undefined} />}
			{showTrivia && <Trivia onClose={() => {
				setShowTrivia(false);
				setPendingGameLaunch(null); // Clear pending game state
				setTranscript(''); // Clear any lingering voice commands
				finalTranscriptRef.current = ''; // Clear the ref too
			}} />}
			{showSudoku && <Sudoku onClose={() => {
				setShowSudoku(false);
				setPendingGameLaunch(null); // Clear pending game state
				setTranscript(''); // Clear any lingering voice commands
				finalTranscriptRef.current = ''; // Clear the ref too
			}} />}
		</>
	)
}


