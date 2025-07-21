import React, { useState } from 'react'
import './FAQPage.css'

const FAQPage = () => {
  const [openItem, setOpenItem] = useState(null)

  const faqData = [
    {
      id: 1,
      question: "What is AI Canvas?",
      answer: "AI Canvas is a revolutionary multimodal AI interaction platform that allows you to interact with artificial intelligence through text, voice, and drawing. Our platform combines the power of multiple input methods to create an intuitive and immersive AI experience."
    },
    {
      id: 2,
      question: "How does voice interaction work?",
      answer: "Our voice interaction feature uses advanced speech recognition technology to understand your spoken commands and questions. Simply speak naturally, and AI Canvas will process your voice input and respond with both text and realistic speech synthesis."
    },
    {
      id: 3,
      question: "Can I draw and get AI responses?",
      answer: "Yes! Our Canvas Drawing feature allows you to create sketches, diagrams, or drawings, and the AI can analyze, interpret, and respond to your visual input. This is perfect for visual learners and creative professionals."
    },
    {
      id: 4,
      question: "Is my data secure?",
      answer: "Absolutely. We take data security seriously. All your interactions are encrypted, and we follow industry-standard security practices. Your personal information and conversation data are protected with enterprise-grade security measures."
    },
    {
      id: 5,
      question: "Do I need to create an account?",
      answer: "While you can explore some features without an account, creating a free account unlocks the full potential of AI Canvas. With an account, you get access to your interaction history, personalized responses, and advanced features."
    },
    {
      id: 6,
      question: "What AI models does AI Canvas use?",
      answer: "AI Canvas integrates with 15+ state-of-the-art AI models, including advanced language models, computer vision systems, and speech processing technologies. We continuously update our model selection to provide you with the best AI capabilities."
    },
    {
      id: 7,
      question: "Can I use AI Canvas on mobile devices?",
      answer: "Yes! AI Canvas is fully responsive and works seamlessly on desktop, tablet, and mobile devices. Our voice and drawing features are optimized for touch interfaces and mobile browsers."
    },
    {
      id: 8,
      question: "Is there a limit to how much I can use AI Canvas?",
      answer: "We offer different usage tiers. Free accounts have generous daily limits, while premium accounts enjoy unlimited interactions. All users get access to our core multimodal features."
    },
    {
      id: 9,
      question: "How accurate are the AI responses?",
      answer: "Our AI models are highly accurate and continuously improving. We achieve 99% user satisfaction through advanced model fine-tuning and real-time learning from user interactions. However, we always recommend verifying important information."
    },
    {
      id: 10,
      question: "Can I integrate AI Canvas with other tools?",
      answer: "Yes! We offer API access and integrations with popular productivity tools, design software, and development platforms. Contact our team to learn more about enterprise integrations and custom solutions."
    }
  ]

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id)
  }

  return (
    <div className="faq-page">
      <div className="faq-page-container">
        <div className="faq-page-header">
          <div className="faq-header-content">
            <h1 className="faq-page-title">Frequently Asked Questions</h1>
            <p className="faq-page-subtitle">
              Find answers to common questions about AI Canvas and our multimodal AI platform
            </p>
          </div>
        </div>

        <div className="faq-page-content">
          <div className="faq-page-list">
            {faqData.map((item) => (
              <div 
                key={item.id} 
                className={`faq-page-item ${openItem === item.id ? 'active' : ''}`}
              >
                <button 
                  className="faq-page-question"
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="question-text">{item.question}</span>
                  <div className="question-icon">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className={`chevron ${openItem === item.id ? 'rotated' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                
                <div className={`faq-page-answer ${openItem === item.id ? 'expanded' : ''}`}>
                  <div className="answer-content">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-page-footer">
            <div className="faq-contact-section">
              <h3>Still have questions?</h3>
              <p>Can't find the answer you're looking for? Our support team is here to help.</p>
              <div className="contact-buttons">
                <button className="contact-btn primary">
                  Contact Support
                </button>
                <button className="contact-btn secondary">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage 