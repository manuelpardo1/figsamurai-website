// FigSamurai AI Readiness Assessment
// Quiz Logic & Scoring

(function() {
    // State
    const state = {
        currentQuestion: 1,
        totalQuestions: 5,
        answers: {},
        score: 0
    };

    // Tier definitions
    const tiers = [
        { min: 0, max: 40, name: 'Apprentice', label: 'Beginning Your AI Journey', color: '#8B7355' },
        { min: 41, max: 70, name: 'Warrior', label: 'Ready for Growth', color: '#A67C52' },
        { min: 71, max: 100, name: 'Master', label: 'Advanced AI Maturity', color: '#C41E3A' }
    ];

    // DOM Elements
    const progressFill = document.getElementById('progressFill');
    const progressStep = document.getElementById('progressStep');
    const progressPercent = document.getElementById('progressPercent');
    const questionCards = document.querySelectorAll('.question-card');
    const emailForm = document.getElementById('emailForm');
    const scorePreview = document.getElementById('scorePreview');
    const tierPreview = document.getElementById('tierPreview');
    const hiddenScore = document.getElementById('hiddenScore');
    const hiddenTier = document.getElementById('hiddenTier');
    const hiddenAnswers = document.getElementById('hiddenAnswers');
    const resultsForm = document.getElementById('resultsForm');

    // Initialize
    function init() {
        setupOptionListeners();
        setupNavListeners();
        setupFormListener();
        updateProgress();
    }

    // Set up option click listeners
    function setupOptionListeners() {
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                const card = this.closest('.question-card');
                const questionNum = parseInt(card.dataset.question);

                // Remove selected from siblings
                card.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));

                // Select this option
                this.classList.add('selected');

                // Store answer
                state.answers[questionNum] = {
                    value: this.dataset.value,
                    points: parseInt(this.dataset.points)
                };

                // Enable next button
                card.querySelector('.btn-next').disabled = false;
            });
        });
    }

    // Set up navigation listeners
    function setupNavListeners() {
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', function() {
                if (state.currentQuestion < state.totalQuestions) {
                    goToQuestion(state.currentQuestion + 1);
                } else {
                    showEmailForm();
                }
            });
        });

        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', function() {
                if (state.currentQuestion > 1) {
                    goToQuestion(state.currentQuestion - 1);
                }
            });
        });
    }

    // Navigate to question
    function goToQuestion(num) {
        state.currentQuestion = num;

        // Hide all questions
        questionCards.forEach(card => card.classList.remove('active'));

        // Show target question
        document.querySelector(`[data-question="${num}"]`).classList.add('active');

        updateProgress();
    }

    // Update progress bar
    function updateProgress() {
        const percent = ((state.currentQuestion - 1) / state.totalQuestions) * 100;
        progressFill.style.width = `${percent}%`;
        progressStep.textContent = `Question ${state.currentQuestion} of ${state.totalQuestions}`;
        progressPercent.textContent = `${Math.round(percent)}%`;
    }

    // Calculate score
    function calculateScore() {
        let total = 0;
        Object.values(state.answers).forEach(answer => {
            total += answer.points;
        });
        // Max possible: 25 * 5 = 125, normalize to 100
        state.score = Math.round((total / 125) * 100);
        return state.score;
    }

    // Get tier based on score
    function getTier(score) {
        return tiers.find(tier => score >= tier.min && score <= tier.max) || tiers[0];
    }

    // Show email form with score preview
    function showEmailForm() {
        // Hide questions
        questionCards.forEach(card => card.classList.remove('active'));

        // Calculate score
        const score = calculateScore();
        const tier = getTier(score);

        // Update progress to complete
        progressFill.style.width = '100%';
        progressStep.textContent = 'Assessment Complete!';
        progressPercent.textContent = '100%';

        // Show preview
        scorePreview.textContent = score;
        tierPreview.textContent = tier.name + ' Level';

        // Set hidden fields
        hiddenScore.value = score;
        hiddenTier.value = tier.name;
        hiddenAnswers.value = JSON.stringify(state.answers);

        // Show form
        emailForm.classList.add('active');
    }

    // Form submission
    function setupFormListener() {
        resultsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                score: state.score,
                tier: getTier(state.score).name,
                answers: state.answers,
                timestamp: new Date().toISOString()
            };

            // Store in localStorage for results page
            localStorage.setItem('figsamurai_assessment', JSON.stringify(data));

            // Submit to Formspree
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    window.location.href = 'thank-you.html';
                } else {
                    // Still redirect even if Formspree fails
                    window.location.href = 'thank-you.html';
                }
            }).catch(error => {
                console.error('Error:', error);
                // Still redirect even if there's an error
                window.location.href = 'thank-you.html';
            });
        });
    }

    // Start
    init();
})();
