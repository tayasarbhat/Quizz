const app = {
  state: {
    playerName: '',
    selectedSubject: '',
    currentQuestion: 0,
    questions: [],
    answers: [],
    quizStarted: false,
    quizCompleted: false,
    timeLeft: 0,
    timer: null,
    isLoading: false
  },

  subjects: [
    { id: 'Sheet2', name: 'Rivers And Lakes', icon: 'droplet', color: 'from-blue-500 to-cyan-500' },
    { id: 'Sheet3', name: 'Political & Physical Divisions', icon: 'map', color: 'from-green-500 to-emerald-500' },
    { id: 'Sheet4', name: 'Transport & Communication', icon: 'send', color: 'from-purple-500 to-pink-500' },
    { id: 'Sheet1', name: 'Idioms And Phrases', icon: 'message-circle', color: 'from-indigo-500 to-purple-500' },
    // Additional subjects
    { id: 'Sheet5', name: 'Mountains and Plateaus', icon: 'mountain', color: 'from-red-500 to-orange-500' },
    { id: 'Sheet6', name: 'Climate and Weather', icon: 'cloud-snow', color: 'from-teal-500 to-green-500' },
    { id: 'Sheet7', name: 'Historical Events', icon: 'book', color: 'from-yellow-500 to-orange-500' },
    // You can add more subjects as needed
  ],

  scriptURL: 'https://script.google.com/macros/s/AKfycbyRUf1Lgz_UuPPs8JlM133i7_zw6lvw_sFMpVh1xREbrRTQ22UVNtlntNjIgLh0lRvd/exec',

  async init() {
    this.renderNameInput();
  },

  async fetchQuestions(sheetId) {
    try {
      const response = await fetch(`${this.scriptURL}?sheet=${sheetId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions (Status: ${response.status})`);
      }
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        return data.questions;
      } else {
        throw new Error("No questions available for this subject");
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  renderNameInput() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
        <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <i data-lucide="user-circle" class="w-12 h-12 text-white"></i>
        </div>
        <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          Welcome to the Quiz
        </h2>
        <p class="text-gray-600 mb-8 text-lg">Enter your name to begin</p>
        <form id="name-form" class="max-w-sm mx-auto">
          <input
            type="text"
            id="name-input"
            placeholder="Enter your name"
            class="w-full px-6 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none mb-6 text-lg"
            required
          >
          <button
            type="submit"
            class="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-lg font-medium"
          >
            Start Quiz
          </button>
        </form>
      </div>
    `;

    lucide.createIcons();
    
    document.getElementById('name-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name-input').value.trim();
      if (name) {
        this.state.playerName = name;
        this.renderSubjectSelection();
      }
    });
  },

  renderSubjectSelection() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-4xl mx-auto">
        <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <i data-lucide="book-open" class="w-12 h-12 text-white"></i>
        </div>
        <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          Choose Your Subject
        </h2>
        <p class="text-gray-600 mb-8 text-lg">Select a subject to begin the quiz</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.subjects.map(subject => `
            <button
              onclick="app.selectSubject('${subject.id}')"
              class="group relative p-6 rounded-xl border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:scale-102"
            >
              <div class="absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center">
                  <i data-lucide="${subject.icon}" class="w-6 h-6 text-white"></i>
                </div>
                <span class="text-xl font-medium text-gray-800">${subject.name}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  async selectSubject(subjectId) {
    this.state.selectedSubject = subjectId;
    this.state.isLoading = true;
    this.renderLoader();
    
    try {
      const questions = await this.fetchQuestions(subjectId);
      this.state.questions = questions;
      this.state.answers = new Array(questions.length).fill(null);
      this.state.timeLeft = questions.length * 30;
      this.state.isLoading = false;
      this.startQuiz();
    } catch (error) {
      this.state.isLoading = false;
      alert('Failed to load questions. Please try again.');
      this.renderSubjectSelection();
    }
  },

  renderLoader() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-lg">
        <div class="text-center">
          <div class="relative w-48 h-48 mx-auto mb-8">
            <div class="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_3s_linear_infinite]"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-[spin_2s_linear_infinite]"></div>
            <div class="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center">
              <span class="text-4xl font-bold text-white">1</span>
            </div>
          </div>
          <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Loading Questions...
          </div>
          <div class="mt-4 w-64 h-2 mx-auto bg-gray-700/30 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading"></div>
          </div>
        </div>
      </div>
    `;
  },
      
  renderLoader2() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-lg">
        <div class="text-center">
          <div class="relative w-48 h-48 mx-auto mb-8">
            <div class="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_3s_linear_infinite]"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-[spin_2s_linear_infinite]"></div>
            <div class="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center">
              <span class="text-4xl font-bold text-white">1</span>
            </div>
          </div>
          <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Submitting Answers...
          </div>
          <div class="mt-4 w-64 h-2 mx-auto bg-gray-700/30 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading"></div>
          </div>
        </div>
      </div>
    `;
  },

  startQuiz() {
    this.state.quizStarted = true;
    this.startTimer();
    this.renderQuestion();
  },

  startTimer() {
    this.timer = setInterval(() => {
      this.state.timeLeft--;
      this.updateTimer();
      if (this.state.timeLeft <= 0) {
        this.completeQuiz();
      }
    }, 1000);
  },

  updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      const minutes = Math.floor(this.state.timeLeft / 60);
      const seconds = this.state.timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  },

  renderQuestion() {
    const question = this.state.questions[this.state.currentQuestion];
    const container = document.getElementById('quiz-container');
    
    container.innerHTML = `
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div class="flex items-center gap-4 w-full sm:w-auto justify-between">
            <button
              onclick="app.goHome()"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Go to Home"
            >
              <i data-lucide="home" class="w-6 h-6 text-gray-600"></i>
            </button>
            
            <div class="relative inline-flex items-center justify-center">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-lg"></div>
              <svg width="60" height="60" class="transform -rotate-90">
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  fill="none"
                  stroke="rgba(229, 231, 235, 0.5)"
                  stroke-width="4"
                ></circle>
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  fill="none"
                  stroke="url(#gradient)"
                  stroke-width="4"
                  stroke-dasharray="${2 * Math.PI * 28}"
                  stroke-dashoffset="${2 * Math.PI * 28 * (1 - (this.state.currentQuestion + 1) / this.state.questions.length)}"
                  stroke-linecap="round"
                  class="transition-all duration-500 ease-out"
                ></circle>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6366F1"></stop>
                    <stop offset="100%" stop-color="#A855F7"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${this.state.currentQuestion + 1}/${this.state.questions.length}
                </span>
              </div>
            </div>
          </div>

          <div class="relative flex items-center gap-3 bg-black/5 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20">
            <i data-lucide="clock" class="w-5 h-5 text-indigo-600"></i>
            <span id="timer" class="font-mono text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${Math.floor(this.state.timeLeft / 60)}:${(this.state.timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        
        <div class="relative mt-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
            ${question.question}
          </h2>
        </div>
        
        <div class="space-y-4 mb-8">
          ${question.options.map((option, index) => `
            <button
              onclick="app.selectAnswer(${index})"
              class="group w-full p-5 text-left rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                this.state.answers[this.state.currentQuestion] === index
                ? 'border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 text-white transform scale-102'
                : 'border-gray-100 hover:border-transparent hover:shadow-lg hover:scale-101'
              }"
            >
              ${this.state.answers[this.state.currentQuestion] !== index ? `
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              ` : ''}
              <div class="flex items-center">
                <span class="inline-block w-10 h-10 rounded-full flex items-center justify-center text-base
                  ${this.state.answers[this.state.currentQuestion] === index
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-700 group-hover:bg-white/80'
                  }"
                >
                  ${String.fromCharCode(65 + index)}
                </span>
                <span class="ml-4 text-base ${
                  this.state.answers[this.state.currentQuestion] === index ? 'text-white' : 'text-gray-700'
                }">
                  ${option}
                </span>
              </div>
            </button>
          `).join('')}
        </div>
        
        <div class="flex justify-between items-center">
          ${this.state.currentQuestion > 0 ? `
            <button
              onclick="app.previousQuestion()"
              class="flex items-center px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
              Previous
            </button>
          ` : '<div></div>'}
          
          <button
            onclick="app.nextQuestion()"
            class="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            ${this.state.currentQuestion === this.state.questions.length - 1 ? 'Finish' : 'Next'}
            ${this.state.currentQuestion < this.state.questions.length - 1 ? `
              <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i>
            ` : ''}
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  selectAnswer(index) {
    this.state.answers[this.state.currentQuestion] = index;
    this.renderQuestion();
  },

  previousQuestion() {
    if (this.state.currentQuestion > 0) {
      this.state.currentQuestion--;
      this.renderQuestion();
    }
  },

  nextQuestion() {
    if (this.state.currentQuestion < this.state.questions.length - 1) {
      this.state.currentQuestion++;
      this.renderQuestion();
    } else {
      this.completeQuiz();
    }
  },

  async completeQuiz() {
    clearInterval(this.timer);
    this.state.quizCompleted = true;
    this.renderLoader2();
    const score = this.calculateScore();
    
    try {
      const response = await fetch(this.scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          "name": this.state.playerName,
          "score": score,
          "sheet": 'Sheet1',
          "column_name": 'M',
          "column_score": 'N'
        }).toString()
      });
      const result = await response.json();
      console.log('Score saved successfully:', result);
    } catch (error) {
      console.error('Error saving score:', error);
    }

    this.renderResults();
  },

  calculateScore() {
    return this.state.answers.reduce((score, answer, index) => {
      return score + (answer === this.state.questions[index].answer ? 1 : 0);
    }, 0);
  },

  async renderResults() {
    const score = this.calculateScore();
    const percentage = Math.round((score / this.state.questions.length) * 100);
    
    // Create confetti effect
    const createConfetti = () => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = ['#6366f1', '#a855f7', '#ec4899'][Math.floor(Math.random() * 3)];
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    };

    // Add confetti animation
    for (let i = 0; i < 50; i++) {
      setTimeout(createConfetti, i * 100);
    }

    try {
      const leaderboardResponse = await fetch(`${this.scriptURL}?sheet=Sheet1&leaderboard=true`);
      const leaderboardData = await leaderboardResponse.json();
      const sortedScores = leaderboardData.entries.sort((a, b) => b.score - a.score);
      const userRank = sortedScores.findIndex(entry => entry.name === this.state.playerName) + 1;

      const container = document.getElementById('quiz-container');
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <!-- Score Card -->
          <div class="glassmorphism rounded-3xl p-8 shadow-xl" data-aos="fade-right">
            <div class="text-center">
              <div class="relative w-40 h-40 mx-auto mb-8">
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50"></div>
                <div class="relative w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span class="text-5xl font-bold text-white">${percentage}%</span>
                </div>
              </div>
              <h2 class="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                ${this.state.playerName}
              </h2>
              <p class="text-xl text-gray-600 mb-8">
                Rank #${userRank} • ${score}/${this.state.questions.length} correct
              </p>
              <div class="flex gap-4 justify-center">
                <button
                  onclick="app.showReview()"
                  class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <i data-lucide="book-open" class="w-5 h-5"></i>
                  Review Answers
                </button>
                <button
                  onclick="app.restartQuiz()"
                  class="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <i data-lucide="refresh-ccw" class="w-5 h-5"></i>
                  Try Again
                </button>
              </div>
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="glassmorphism rounded-3xl p-8 shadow-xl" data-aos="fade-left">
            <h3 class="text-2xl font-bold mb-6 text-gray-800">Top Performers</h3>
            <div class="space-y-4">
              ${sortedScores.slice(0, 5).map((entry, index) => `
                <div class="flex items-center p-4 rounded-xl ${
                  entry.name === this.state.playerName 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                    : 'bg-white/50'
                }">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.name === this.state.playerName ? 'bg-white/20' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  } mr-4">
                    <span class="${entry.name === this.state.playerName ? 'text-white' : 'text-white'}">${index + 1}</span>
                  </div>
                  <span class="flex-1 font-medium">${entry.name}</span>
                  <span class="font-bold">${entry.score}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      lucide.createIcons();
      AOS.init();

    } catch (error) {
      console.error('Error rendering results:', error);
    }
  },

  showReview() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800">Review Answers</h2>
          <button
            onclick="app.renderResults()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        
        <div class="space-y-6">
          ${this.state.questions.map((question, index) => `
            <div class="review-card glassmorphism rounded-2xl p-6" data-aos="fade-up" data-aos-delay="${index * 100}">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  ${index + 1}
                </div>
                <h3 class="text-xl font-semibold text-gray-800">${question.question}</h3>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                ${question.options.map((option, optIndex) => `
                  <div class="flex items-center p-4 rounded-xl ${
                    optIndex === question.answer 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : optIndex === this.state.answers[index]
                      ? 'bg-red-100 border-2 border-red-500'
                      : 'bg-white/50'
                  }">
                    <span class="w-8 h-8 rounded-full flex items-center justify-center ${
                      optIndex === question.answer 
                        ? 'bg-green-500 text-white'
                        : optIndex === this.state.answers[index]
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200'
                    } mr-3">
                      ${String.fromCharCode(65 + optIndex)}
                    </span>
                    <span>${option}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="mt-4 p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-2 text-gray-600 mb-2">
                  <i data-lucide="info" class="w-5 h-5"></i>
                  <span class="font-medium">Explanation</span>
                </div>
                <p class="text-gray-700">${question.explanation || 'No explanation available.'}</p>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="fixed bottom-8 right-8">
          <button
            onclick="app.renderResults()"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Back to Results
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
    AOS.init();
  },

  goHome() {
    clearInterval(this.timer); // Stop the timer if it's running
    this.state.selectedSubject = '';
    this.state.currentQuestion = 0;
    this.state.questions = [];
    this.state.answers = [];
    this.state.quizStarted = false;
    this.state.quizCompleted = false;
    this.state.timeLeft = 0;
    this.state.isLoading = false;
    this.renderSubjectSelection();
  },

  restartQuiz() {
    clearInterval(this.timer);
    this.state = {
      playerName: '',
      selectedSubject: '',
      currentQuestion: 0,
      questions: [],
      answers: [],
      quizStarted: false,
      quizCompleted: false,
      timeLeft: 0,
      timer: null,
      isLoading: false
    };
    this.init();
  }
};

app.init();
