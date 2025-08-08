// STEP 1: The Interactive Quiz Component
// This is the final, fully functional version of the Quiz component.
// FILE: src/components/courses/Quiz.js

import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Quiz = ({ lesson, onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isPassed, setIsPassed] = useState(false);

    let quizData = null;
    try {
        // Safely parse the JSON content from the database
        quizData = JSON.parse(lesson.content);
    } catch (e) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Error: The quiz for this lesson is formatted incorrectly.</div>;
    }

    if (!quizData || !Array.isArray(quizData.questions) || !quizData.passingScore) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Error: Quiz data is missing or incomplete.</div>;
    }

    const { questions, passingScore } = quizData;

    const handleAnswer = (qIndex, option) => {
        setAnswers({ ...answers, [qIndex]: option });
    };

    const handleSubmit = () => {
        let currentScore = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                currentScore++;
            }
        });
        setScore(currentScore);
        const passed = currentScore >= passingScore;
        setIsPassed(passed);
        setShowResult(true);
        // If the user passes, we call the onComplete function to save progress
        if (passed) {
            onComplete();
        }
    };

    if (showResult) {
        return (
            <div className={`p-6 rounded-lg ${isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`text-2xl font-bold mb-2 ${isPassed ? 'text-green-800' : 'text-red-800'}`}>Quiz Result</h3>
                <p className="text-lg mb-4">You scored {score} out of {questions.length}. You needed {passingScore} to pass.</p>
                {isPassed ? (
                    <p className="font-semibold text-green-700">Congratulations, you passed! The next lesson is now unlocked.</p>
                ) : (
                    <div>
                        <p className="font-semibold text-red-700 mb-4">You did not pass. Please review the material and try again.</p>
                        <button onClick={() => setShowResult(false)} className="bg-[#0A2463] text-white font-bold py-2 px-6 rounded-lg">Retry Quiz</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            {questions.map((q, index) => (
                <div key={index} className="mb-6">
                    <p className="font-semibold text-lg text-gray-800 mb-3">{index + 1}. {q.question}</p>
                    <div className="space-y-2">
                        {q.options.map(option => (
                            <label key={option} className={`block p-3 rounded-lg border-2 transition-all ${answers[index] === option ? 'border-[#0A2463] bg-blue-50' : 'border-gray-200'} hover:border-blue-400 cursor-pointer`}>
                                <input type="radio" name={`question-${index}`} value={option} onChange={() => handleAnswer(index, option)} className="hidden" />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button 
                onClick={handleSubmit} 
                disabled={Object.keys(answers).length !== questions.length} 
                className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
                Submit Quiz
            </button>
        </div>
    );
};

export default Quiz;


// -----------------------------------------------------------------
