import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
	try {
		const { message, conversationHistory = [] } = await request.json()
		if (!message) {
			return NextResponse.json({ error: 'Message is required' }, { status: 400 })
		}

		const API_KEY = process.env.GEMINI_API_KEY
		// Build instruction context from local file
		let instructions = 'You are a friendly AI robot assistant named OneRobo who looks after little children who were left at home by their working parents. Keep responses under 100 words.'
		try {
			const instructionsPath = join(process.cwd(), 'chatbot-instructions.txt')
			instructions = readFileSync(instructionsPath, 'utf-8').trim()
		} catch (error) {
			console.log('Could not read instructions file, using default')
		}

		let conversationContext = instructions
		if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
			conversationContext += '\n\nCONVERSATION HISTORY:\n'
			for (const msg of conversationHistory) {
				const role = msg.role === 'user' ? 'CHILD' : 'ONEROBO'
				conversationContext += `${role}: ${msg.content}\n`
			}
		}
		conversationContext += `\nCHILD: "${message}"\n\nONEROBO, respond as yourself in 1-3 sentences.`

		if (!API_KEY) {
			// Simple local echo if no key
			return NextResponse.json({ response: 'I heard you. Let\'s play a game or chat!' })
		}

		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 8000)
		const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ contents: [{ parts: [{ text: conversationContext }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 200 } }),
				signal: controller.signal
			}
		)
		clearTimeout(timeoutId)
		const data = await resp.json()
		if (!resp.ok) {
			console.error('Gemini API error:', data)
			return NextResponse.json({ response: "Sorry, I'm having trouble right now." })
		}
		const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I didn't understand that."
		return NextResponse.json({ response: aiResponse })
	} catch (e) {
		console.error('Error calling Gemini API:', e)
		let errorMessage = "Sorry, I couldn't process that."
		if (e instanceof Error) {
			if (e.name === 'AbortError') {
				errorMessage = "Sorry, that took too long. Please try again!"
			}
		}
		return NextResponse.json({ response: errorMessage })
	}
}

