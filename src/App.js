import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { category: { questionIndex: answer } }
  const [completedCategories, setCompletedCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get('/mockQuizData.json');
        setQuizData(response.data.categories);
        setLoading(false);
      } catch (err) {
        setError('Error loading quiz data');
        setLoading(false);
      }
    };
    fetchQuizData();
  }, []);

  // Calculate score for a category
  const calculateCategoryScore = (categoryName) => {
    const category = quizData.find(cat => cat.categoryName === categoryName);
    if (!category) return 0;
    let correct = 0;
    category.questions.forEach((q, index) => {
      if (selectedAnswers[categoryName]?.[index] === q.correctAnswer) correct++;
    });
    return correct;
  };

  // Handle category completion
  const handleCompleteCategory = () => {
    setCompletedCategories([...completedCategories, selectedCategory]);
    setSelectedCategory('');
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  // Check if all categories are completed
  const allCategoriesCompleted = completedCategories.length === quizData.length;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Render final results page
  // Render final results page
if (allCategoriesCompleted) {
  return (
    <div className="container results">
      <h1>Final Results</h1>
      <ul className="result-list">
        {quizData.map((category) => {
          const score = calculateCategoryScore(category.categoryName);
          const percentage = ((score / category.questions.length) * 100).toFixed(2);
          return (
            <li key={category.categoryName} className="result-item">
              <h3>{category.categoryName}</h3>
              <p>Score: {score}/{category.questions.length}</p>
              <p>Correct Rate: {percentage}%</p>
            </li>
          );
        })}
      </ul>
      <button onClick={() => window.location.reload()}>Restart Quiz</button>
    </div>
  );
}

  // Render category selection
  if (!selectedCategory) {
    return (
      <div className="container">
        <h1>Select a Category</h1>
        <ul className="categories">
          {quizData.map((cat) => (
            <li key={cat.categoryName}>
              <button
                className={`category-btn ${completedCategories.includes(cat.categoryName) ? 'completed' : ''}`}
                onClick={() => setSelectedCategory(cat.categoryName)}
                disabled={completedCategories.includes(cat.categoryName)}
              >
                {cat.categoryName} {completedCategories.includes(cat.categoryName) && '✓'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Get current category's questions
  const currentCategory = quizData.find(cat => cat.categoryName === selectedCategory);
  const currentQuestions = currentCategory?.questions || [];

  // Render quiz questions
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const savedAnswer = selectedAnswers[selectedCategory]?.[currentQuestionIndex];

  return (
    <div className="container">
      <h2>{selectedCategory}</h2>
      <button
        className="switch-btn"
        onClick={() => setSelectedCategory('')}
      >
        Switch Category
      </button>
      <div className="question-container">
        <p>Question {currentQuestionIndex + 1}/{currentCategory.questions.length}</p>
        <h3>{currentQuestion.question}</h3>
        <ul className="options">
          {currentQuestion.options.map((option, index) => (
            <li key={index}>
              <label>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={savedAnswer === option}
                  onChange={() => setSelectedAnswers({
                    ...selectedAnswers,
                    [selectedCategory]: {
                      ...selectedAnswers[selectedCategory],
                      [currentQuestionIndex]: option
                    }
                  })}
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
        <button
          className="next-btn"
          onClick={() => {
            if (currentQuestionIndex < currentCategory.questions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
              setShowResults(true);
            }
          }}
        >
          {currentQuestionIndex < currentCategory.questions.length - 1 ? 'Next' : 'Submit'}
        </button>
        {showResults && (
          <div className="result-popup">
            <p>Category completed! Score: {calculateCategoryScore(selectedCategory)}</p>
            <button onClick={handleCompleteCategory}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;