// SurveyAI Application JavaScript

// Application data
const appData = {
    sample_questions: [
        { "id": "nss_1", "text": "What is your household's primary source of income?", "type": "multiple_choice", "options": ["Agriculture", "Business", "Salary/Wages", "Pension", "Other"] },
        { "id": "nss_2", "text": "How many members are there in your household?", "type": "number", "min": 1, "max": 20 },
        { "id": "nss_3", "text": "What is the highest level of education completed by the household head?", "type": "multiple_choice", "options": ["No formal education", "Primary", "Secondary", "Higher Secondary", "Graduate", "Post-graduate"] },
        { "id": "nss_4", "text": "Does your household own any of the following assets?", "type": "multiple_select", "options": ["Television", "Refrigerator", "Two-wheeler", "Four-wheeler", "Computer/Laptop"] },
        { "id": "nss_5", "text": "What is your opinion about the government's digital initiatives?", "type": "rating", "scale": 5 }
    ],
    languages: [
        { "code": "en", "name": "English", "native": "English" },
        { "code": "hi", "name": "Hindi", "native": "हिंदी" },
        { "code": "te", "name": "Telugu", "native": "తెలుగు" },
        { "code": "ta", "name": "Tamil", "native": "தমிழ்" },
        { "code": "bn", "name": "Bengali", "native": "বাংলা" },
        { "code": "gu", "name": "Gujarati", "native": "ગુજરાતી" }
    ]
};

// Application state
let currentSection = 'landing';
let currentChannel = 'whatsapp';
let surveyQuestions = [];
let currentQuestionIndex = 0;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing SurveyAI application...');
    initializeNavigation();
    initializeSurveyBuilder();
    initializeChannelTabs();
    initializeModals();
    initializeInteractiveElements();

    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 100);
});

// Navigation functionality - FIXED
function initializeNavigation() {
    console.log('Setting up navigation...');

    // Handle navigation menu items
    const navItems = document.querySelectorAll('[data-section]');
    console.log('Found navigation items:', navItems.length);

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            console.log('Navigation clicked:', targetSection);
            showSection(targetSection);
        });
    });

    // Also handle brand logo click to go home
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('landing');
        });
        navBrand.style.cursor = 'pointer';
    }
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);

    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        console.log('Section shown successfully:', sectionId);

        // Initialize section-specific functionality
        if (sectionId === 'supervisor') {
            setTimeout(() => initializeCharts(), 100);
        }
    } else {
        console.error('Section not found:', sectionId);
    }
}

// Survey Builder functionality - ENHANCED
function initializeSurveyBuilder() {
    console.log('Setting up survey builder...');

    const canvas = document.getElementById('survey-canvas');
    const questionTypes = document.querySelectorAll('.question-type');
    const nssQuestions = document.querySelectorAll('.nss-question');
    const generateBtn = document.getElementById('generate-ai-survey');
    const previewBtn = document.getElementById('preview-survey');
    const saveBtn = document.getElementById('save-survey');
    const deployBtn = document.getElementById('deploy-survey');

    if (!canvas) {
        console.log('Survey canvas not found, skipping builder setup');
        return;
    }

    // Make canvas droppable
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.backgroundColor = 'var(--color-bg-1)';
    });

    canvas.addEventListener('dragleave', function(e) {
        this.style.backgroundColor = '';
    });

    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.backgroundColor = '';

        const data = e.dataTransfer.getData('text/plain');
        console.log('Dropped data:', data);

        if (data.startsWith('nss_')) {
            addNSSQuestion(data);
        } else {
            addQuestionType(data);
        }
    });

    // Set up draggable items
    questionTypes.forEach(type => {
        type.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.type);
            console.log('Dragging question type:', this.dataset.type);
        });
    });

    nssQuestions.forEach(question => {
        question.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.questionId);
            console.log('Dragging NSS question:', this.dataset.questionId);
        });
    });

    // AI survey generation
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const prompt = document.getElementById('ai-prompt').value;
            if (prompt.trim()) {
                generateAISurvey(prompt);
            } else {
                alert('Please enter a description for your survey');
            }
        });
    }

    // Button actions
    if (previewBtn) previewBtn.addEventListener('click', previewSurvey);
    if (saveBtn) saveBtn.addEventListener('click', saveSurvey);
    if (deployBtn) deployBtn.addEventListener('click', deploySurvey);
}

function addNSSQuestion(questionId) {
    console.log('Adding NSS question:', questionId);
    const question = appData.sample_questions.find(q => q.id === questionId);
    if (question) {
        addQuestionToCanvas(question);
    }
}

function addQuestionType(type) {
    console.log('Adding question type:', type);
    const newQuestion = {
        id: 'q_' + Date.now(),
        text: `New ${type.replace('_', ' ')} question - click to edit`,
        type: type,
        options: type === 'multiple_choice' || type === 'multiple_select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };
    addQuestionToCanvas(newQuestion);
}

function addQuestionToCanvas(question) {
    const canvas = document.getElementById('survey-canvas');
    if (!canvas) return;

    // Remove placeholder if present
    const placeholder = canvas.querySelector('.canvas-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const questionElement = createQuestionElement(question);
    canvas.appendChild(questionElement);
    surveyQuestions.push(question);

    console.log('Question added to canvas:', question.text);
}

function createQuestionElement(question) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'survey-question';
    questionDiv.dataset.questionId = question.id;

    let optionsHtml = '';
    if (question.options) {
        optionsHtml = `
      <div class="question-options">
        ${question.options.map(option => `
          <div class="question-option">
            <span>${option}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  questionDiv.innerHTML = `
    <div class="question-header">
      <div class="question-title">${question.text}</div>
      <div class="question-actions">
        <button class="question-action" onclick="editQuestion('${question.id}')">✏️</button>
        <button class="question-action" onclick="deleteQuestion('${question.id}')">🗑️</button>
      </div>
    </div>
    <div class="question-type">Type: ${question.type.replace('_', ' ')}</div>
    ${optionsHtml}
  `;

  return questionDiv;
}

function generateAISurvey(prompt) {
  const generateBtn = document.getElementById('generate-ai-survey');
  generateBtn.textContent = 'Generating...';
  generateBtn.disabled = true;

  console.log('Generating AI survey for prompt:', prompt);

  // Simulate AI generation
  setTimeout(() => {
    const aiQuestions = [
      {
        id: 'ai_1',
        text: 'What digital payment methods do you use regularly?',
        type: 'multiple_select',
        options: ['UPI (PhonePe/GPay)', 'Credit/Debit Card', 'Mobile Wallet', 'Net Banking', 'Cash Only']
      },
      {
        id: 'ai_2',
        text: 'How comfortable are you with using government digital services?',
        type: 'rating',
        scale: 5
      },
      {
        id: 'ai_3',
        text: 'What is your age group?',
        type: 'multiple_choice',
        options: ['18-25', '26-35', '36-50', '51-65', '65+']
      },
      {
        id: 'ai_4',
        text: 'What challenges do you face when using digital services?',
        type: 'multiple_select',
        options: ['Language barriers', 'Technical difficulties', 'Internet connectivity', 'Security concerns', 'Lack of awareness']
      }
    ];

    // Clear canvas first
    const canvas = document.getElementById('survey-canvas');
    canvas.innerHTML = '';
    surveyQuestions = [];

    // Add AI generated questions
    aiQuestions.forEach(question => {
      addQuestionToCanvas(question);
    });

    generateBtn.textContent = 'Generate Survey with AI';
    generateBtn.disabled = false;

    showSuccessMessage('✅ AI survey generated successfully! Based on your prompt about digital literacy and government services.');
  }, 2000);
}

function previewSurvey() {
  if (surveyQuestions.length === 0) {
    alert('Please add some questions first!');
    return;
  }
  showSuccessMessage('📋 Survey preview: Your survey has ' + surveyQuestions.length + ' questions and is ready for testing.');
}

function saveSurvey() {
  if (surveyQuestions.length === 0) {
    alert('Please add some questions first!');
    return;
  }
  showSuccessMessage('💾 Survey saved successfully with ' + surveyQuestions.length + ' questions!');
}

function deploySurvey() {
  if (surveyQuestions.length === 0) {
    alert('Please add some questions first!');
    return;
  }
  
  showSection('deployment');
  showSuccessMessage('🚀 Survey ready for deployment! Configure your channels below.');
}

// Channel tabs functionality - FIXED
function initializeChannelTabs() {
  console.log('Setting up channel tabs...');
  
  const channelTabs = document.querySelectorAll('.channel-tab');
  const channelContents = document.querySelectorAll('.channel-content');

  console.log('Found channel tabs:', channelTabs.length);
  console.log('Found channel contents:', channelContents.length);

  channelTabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const channel = this.dataset.channel;
      console.log('Switching to channel:', channel);
      
      // Update tabs
      channelTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update content
      channelContents.forEach(content => content.classList.remove('active'));
      const targetContent = document.getElementById(`${channel}-channel`);
      if (targetContent) {
        targetContent.classList.add('active');
        console.log('Channel content switched successfully');
      } else {
        console.error('Channel content not found:', `${channel}-channel`);
      }
      
      currentChannel = channel;
    });
  });
}

// Modal functionality - ENHANCED
function initializeModals() {
  console.log('Setting up modals...');
  
  const modals = document.querySelectorAll('.modal');
  const modalCloses = document.querySelectorAll('.modal-close');
  
  // Data pre-population demo
  const fetchDataBtn = document.getElementById('fetch-data');
  if (fetchDataBtn) {
    fetchDataBtn.addEventListener('click', function() {
      const identifierType = document.getElementById('identifier-type').value;
      const identifierValue = document.getElementById('identifier-value').value;
      
      if (identifierValue.trim()) {
        fetchDataBtn.textContent = 'Fetching...';
        fetchDataBtn.disabled = true;
        
        setTimeout(() => {
          document.getElementById('prepopulated-data').classList.remove('hidden');
          fetchDataBtn.textContent = 'Fetch Pre-population Data';
          fetchDataBtn.disabled = false;
          showSuccessMessage('📊 Data successfully pre-populated from government database!');
        }, 1500);
      } else {
        alert('Please enter an identifier value');
      }
    });
  }

  // Close modals
  modalCloses.forEach(close => {
    close.addEventListener('click', function() {
      this.closest('.modal').classList.add('hidden');
    });
  });

  // Close modal on overlay click
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });
}

// Interactive elements - ENHANCED
function initializeInteractiveElements() {
  console.log('Setting up interactive elements...');
  
  // WhatsApp survey interaction
  const optionBtns = document.querySelectorAll('.option-btn');
  optionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const answer = this.dataset.answer;
      console.log('WhatsApp option selected:', answer);
      addWhatsAppUserMessage(answer);
      
      // Disable all option buttons
      optionBtns.forEach(b => b.disabled = true);
      
      setTimeout(() => {
        addWhatsAppBotMessage("Thank you! How many members are there in your household?", 'number');
      }, 1000);
    });
  });

  // Voice/IVR controls
  const playBtn = document.getElementById('play-voice');
  const pauseBtn = document.getElementById('pause-voice');
  
  if (playBtn) {
    playBtn.addEventListener('click', function() {
      console.log('Playing voice message');
      this.textContent = '⏸ Playing...';
      this.disabled = true;
      if (pauseBtn) pauseBtn.disabled = false;
      
      setTimeout(() => {
        this.textContent = '▶ Play';
        this.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        updateVoiceText("Voice message completed. Please select your response using the keypad below.");
      }, 3000);
    });
  }

  // DTMF keypad
  const keypadBtns = document.querySelectorAll('.keypad-btn');
  keypadBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      console.log('DTMF key pressed:', key);
      this.style.backgroundColor = 'var(--color-primary)';
      this.style.color = 'var(--color-btn-primary-text)';
      
      updateVoiceText(`You pressed ${key}. Processing your response...`);
      
      setTimeout(() => {
        updateVoiceText("Thank you for your response. Moving to the next question...");
        this.style.backgroundColor = '';
        this.style.color = '';
      }, 1500);
    });
  });

  // Mobile app next button
  const mobileNextBtn = document.getElementById('mobile-next');
  if (mobileNextBtn) {
    mobileNextBtn.addEventListener('click', function() {
      const value = document.getElementById('household-members').value;
      if (value && value > 0) {
        console.log('Mobile survey progressing with value:', value);
        updateMobileQuestion();
      } else {
        alert('Please enter a valid number of household members (1 or more)');
      }
    });
  }

  // Language buttons in avatar interface
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.dataset.lang;
      console.log('Avatar language selected:', lang);
      
      // Highlight selected language
      langBtns.forEach(b => {
        b.style.backgroundColor = '';
        b.style.color = '';
      });
      this.style.backgroundColor = 'var(--color-primary)';
      this.style.color = 'var(--color-btn-primary-text)';
      
      updateAvatarMessage(lang);
    });
  });

  // Language feature listen buttons
  const listenBtns = document.querySelectorAll('.language-card .btn');
  listenBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      console.log('Playing language audio');
      const originalText = this.textContent;
      this.textContent = '🔊 Playing...';
      this.disabled = true;
      
      setTimeout(() => {
        this.textContent = originalText;
        this.disabled = false;
      }, 2000);
    });
  });

  // Deployment configuration buttons
  const configBtns = document.querySelectorAll('[id^="config-"]');
  configBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const channel = this.id.replace('config-', '');
      console.log('Configuring channel:', channel);
      showChannelConfig(channel);
    });
  });

  // Add demo buttons for easy access
  setTimeout(() => {
    addDemoButtons();
  }, 500);
}

function addDemoButtons() {
  // Check if already added
  if (document.querySelector('.demo-buttons')) return;
  
  const demoButtons = document.createElement('div');
  demoButtons.className = 'demo-buttons';
  demoButtons.style.cssText = 'position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 8px; z-index: 999;';
  demoButtons.innerHTML = `
    <button class="btn btn--secondary btn--sm" onclick="showModal('prepopulation-modal')"> Data Pre-population</button>
    
  `;
  document.body.appendChild(demoButtons);
}

// Helper functions for interactive elements
function addWhatsAppUserMessage(message) {
  const messagesContainer = document.getElementById('whatsapp-messages');
  if (!messagesContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addWhatsAppBotMessage(message, type = 'text') {
  const messagesContainer = document.getElementById('whatsapp-messages');
  if (!messagesContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot-message';
  
  if (type === 'number') {
    messageDiv.innerHTML = `
      <p>${message}</p>
      <div style="margin-top: 8px;">
        <input type="number" class="form-control" style="margin-bottom: 8px;" placeholder="Enter number" min="1" max="20" id="whatsapp-number-input">
        <button class="btn btn--primary btn--sm" onclick="submitWhatsAppNumber()">Submit</button>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `<p>${message}</p>`;
  }
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function submitWhatsAppNumber() {
  const input = document.getElementById('whatsapp-number-input');
  if (input && input.value) {
    addWhatsAppUserMessage(input.value + ' members');
    setTimeout(() => {
      addWhatsAppBotMessage("Great! What is the highest level of education completed by the household head?", 'options');
    }, 1000);
  }
}

function updateVoiceText(text) {
  const voiceTextElement = document.getElementById('voice-text');
  if (voiceTextElement) {
    voiceTextElement.textContent = text;
  }
}

function updateMobileQuestion() {
  const mobileContent = document.querySelector('#mobile-channel .mobile-content');
  const progressBar = document.querySelector('#mobile-channel .progress-fill');
  const progressText = document.querySelector('#mobile-channel .progress-indicator span');
  
  if (mobileContent) {
    mobileContent.innerHTML = `
      <h3>What is the highest level of education completed by the household head?</h3>
      <select class="form-control" id="education-level">
        <option value="">Select education level</option>
        <option value="none">No formal education</option>
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="higher_secondary">Higher Secondary</option>
        <option value="graduate">Graduate</option>
        <option value="postgraduate">Post-graduate</option>
      </select>
      <div class="mobile-actions">
        <button class="btn btn--outline" onclick="previousMobileQuestion()">Previous</button>
        <button class="btn btn--primary" onclick="nextMobileQuestion()">Next</button>
      </div>
    `;
  }
  
  if (progressBar) progressBar.style.width = '40%';
  if (progressText) progressText.textContent = 'Question 2 of 5';
}

function nextMobileQuestion() {
  const educationLevel = document.getElementById('education-level');
  if (educationLevel && educationLevel.value) {
    showSuccessMessage('📱 Mobile survey progressing! Question 3 of 5 would appear next.');
  } else {
    alert('Please select an education level');
  }
}

function previousMobileQuestion() {
  showSuccessMessage('📱 Returning to previous question (demo)');
}

function updateAvatarMessage(lang) {
  const langNames = {
    'en': 'English',
    'hi': 'Hindi (हिंदी)',
    'te': 'Telugu (తెలుగు)'
  };
  
  const avatarMessage = document.querySelector('.avatar-message p');
  const languageSelector = document.querySelector('.language-selector');
  
  if (avatarMessage) {
    avatarMessage.textContent = 
      `Perfect! I'll continue our conversation in ${langNames[lang]}. Let's start with the first question about your household income source.`;
  }
  
  if (languageSelector) {
    languageSelector.innerHTML = 
      '<div class="status status--success">✅ Language set to ' + langNames[lang] + '</div>';
  }
}

function showChannelConfig(channel) {
  const channelNames = {
    'whatsapp': 'WhatsApp Business API',
    'ivr': 'Voice/IVR System',
    'mobile': 'Mobile Application',
    'avatar': 'AI Avatar Interface'
  };
  
  showSuccessMessage(`⚙️ ${channelNames[channel]} configuration panel would open here. Settings include: API keys, phone numbers, voice settings, and deployment parameters.`);
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function showSuccessMessage(message) {
  // Remove existing message
  const existing = document.querySelector('.success-message');
  if (existing) {
    existing.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = message;
  
  // Insert at the top of the current section
  const activeSection = document.querySelector('.section.active');
  if (activeSection) {
    const container = activeSection.querySelector('.container');
    if (container) {
      container.insertBefore(messageDiv, container.firstChild);
      // Scroll to top to show the message
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // Auto remove after 7 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 7000);
}

// Charts initialization - ENHANCED
function initializeCharts() {
  console.log('Initializing charts...');
  
  // Only initialize if we're in the supervisor section
  if (currentSection !== 'supervisor' && currentSection !== 'paradata') {
    console.log('Not in dashboard section, skipping charts');
    return;
  }

  // Progress Chart
  const progressCtx = document.getElementById('progressChart');
  if (progressCtx && !progressCtx.chartInstance) {
    try {
      progressCtx.chartInstance = new Chart(progressCtx, {
        type: 'doughnut',
        data: {
          labels: ['Completed Surveys', 'Remaining Target'],
          datasets: [{
            data: [1247, 753],
            backgroundColor: ['#1FB8CD', '#FFC185'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      console.log('Progress chart initialized');
    } catch (error) {
      console.error('Error initializing progress chart:', error);
    }
  }

  // Response Time Chart
  const responseTimeCtx = document.getElementById('responseTimeChart');
  if (responseTimeCtx && !responseTimeCtx.chartInstance) {
    try {
      responseTimeCtx.chartInstance = new Chart(responseTimeCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Average Response Time (minutes)',
            data: [12.5, 13.2, 11.8, 14.1, 13.5, 12.9, 13.2],
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            }
          }
        }
      });
      console.log('Response time chart initialized');
    } catch (error) {
      console.error('Error initializing response time chart:', error);
    }
  }

  // Device Chart
  const deviceCtx = document.getElementById('deviceChart');
  if (deviceCtx && !deviceCtx.chartInstance) {
    try {
      deviceCtx.chartInstance = new Chart(deviceCtx, {
        type: 'bar',
        data: {
          labels: ['Android', 'iOS', 'Web Browser', 'USSD/SMS'],
          datasets: [{
            label: 'Survey Responses',
            data: [450, 320, 280, 89],
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Responses'
              }
            }
          }
        }
      });
      console.log('Device chart initialized');
    } catch (error) {
      console.error('Error initializing device chart:', error);
    }
  }
}

// Real-time updates simulation
function startRealTimeUpdates() {
  setInterval(() => {
    // Update random metrics slightly
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach(metric => {
      if (metric.textContent.includes('%')) {
        const currentValue = parseFloat(metric.textContent);
        const variation = (Math.random() - 0.5) * 0.1;
        const newValue = Math.max(80, Math.min(100, currentValue + variation));
        metric.textContent = newValue.toFixed(1) + '%';
      }
    });

    // Update progress bars slightly
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      const currentWidth = parseFloat(bar.style.width) || 60;
      if (currentWidth < 100) {
        const increment = Math.random() * 0.2;
        bar.style.width = Math.min(100, currentWidth + increment) + '%';
      }
    });
  }, 5000);
}

// Global functions for onclick handlers
window.editQuestion = function(questionId) {
  showSuccessMessage(`✏️ Question editor would open for question ${questionId} (demo mode)`);
};

window.deleteQuestion = function(questionId) {
  const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
  if (questionElement) {
    questionElement.remove();
    surveyQuestions = surveyQuestions.filter(q => q.id !== questionId);
    
    // Add placeholder back if no questions
    if (surveyQuestions.length === 0) {
      const canvas = document.getElementById('survey-canvas');
      if (canvas) {
        canvas.innerHTML = '<div class="canvas-placeholder"><p>Drag questions here or use AI to generate survey</p></div>';
      }
    }
    showSuccessMessage('🗑️ Question deleted successfully');
  }
};

window.showModal = showModal;
window.submitWhatsAppNumber = submitWhatsAppNumber;
window.nextMobileQuestion = nextMobileQuestion;
window.previousMobileQuestion = previousMobileQuestion;

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.altKey) {
    switch(e.key) {
      case '1':
        showSection('landing');
        break;
      case '2':
        showSection('builder');
        break;
      case '3':
        showSection('deployment');
        break;
      case '4':
        showSection('sample');
        break;
      case '5':
        showSection('supervisor');
        break;
      case '6':
        showSection('paradata');
        break;
    }
  }
});

// Start real-time updates
setTimeout(() => {
  startRealTimeUpdates();
  console.log('Real-time updates started');
}, 3000);