'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Book, X, Lightbulb, GraduationCap, ArrowBigDownDashIcon } from 'lucide-react'
import { getOpenAIResponse } from '@/actions/(common)/agents/thecoderzbot.action'

interface Message {
    id: number
    text: string
    isUser: boolean
    timestamp: Date
}

export default function TheCoderzBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = {
            id: Date.now(),
            text: input,
            isUser: true,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await getOpenAIResponse(input);
            const botMessage = {
                id: Date.now() + 1,
                text: response,
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error('Error getting OpenAI response:', error)
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error while processing your request.',
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(c => !c)}
                className="fixed bottom-4 right-4 rounded-full h-14 w-14 text-white dark:text-black shadow-lg hover:bg-sky-700"
            >
                {isOpen ? <ArrowBigDownDashIcon className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
            </Button>
            {
                isOpen && (
                    <div
                        ref={modalRef}
                        className="fixed z-21 bottom-20 right-4 max-w-[400px] rounded-lg shadow-xl bg-white dark:bg-black border border-gray-300 animate-in slide-in-from-bottom-2"
                    >
                        <div className="flex flex-col h-[500px]">
                            <div className="flex items-center justify-between p-4 bg-sky-600 text-white rounded-t-lg">
                                <div className="flex items-center">
                                    <Book className="w-6 h-6 mr-2" />
                                    <h1 className="text-xl font-semibold">Study Buddy</h1>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-blue-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {
                                    messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                                            <Avatar className="w-16 h-16 bg-blue-100">
                                                <AvatarFallback className="bg-blue-500 text-white">
                                                    <Lightbulb />
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-xl text-center text-gray-600">
                                                How can I assist with your studies today?
                                            </p>
                                        </div>
                                    )
                                }
                                {
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-xl p-3 shadow-md ${message.isUser
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-200'
                                                    }`}
                                            >
                                                <p>{message.text}</p>
                                                <p
                                                    className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {
                                                        message.timestamp.toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                                {
                                    isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Coming Soon..."
                                        className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        disabled={true}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!input.trim() || isLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
