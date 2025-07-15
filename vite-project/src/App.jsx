import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import BlurText from './components/BlurText';
import './App.css'

function App() {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="app">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-text">AI Canvas</span>
          </div>
          <div className="nav-menu">
            <a href="#" className="nav-link active">Home</a>
            <a href="#" className="nav-link">About</a>
            <a href="#" className="nav-link">Services</a>
            <a href="#" className="nav-link">Process</a>
            <a href="#" className="nav-link">Clients</a>
          </div>
          <div className="nav-cta">
            <button className="start-project-btn">Start A Project</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <div className="text-section">
            <p className="tagline">MULTIMODAL AI INTERACTION PLATFORM</p>
            <h1 className="main-heading">
              Experience<br />
              The Magic Of<br />
              <span className="ai-canvas">AI Canvas!</span>
            </h1>
            <p className="description">
              Interact with AI through text, voice, or drawing.<br />
              Get intelligent responses via text and realistic speech.
            </p>
          </div>
          
          <div className="animation-section">
            <DotLottieReact
              src="https://lottie.host/36e46a2b-188d-4844-a1e9-597d94e2baab/mdmqBwL9kR.lottie"
              loop={false}
              autoplay
              className="ai-animation"
            />
          </div>
        </div>
      </main>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-animation">
            <dotlottie-wc 
              src="https://lottie.host/9e6b2324-3d56-4018-9089-4d36638ad4fa/BVTXsAOh1x.lottie" 
              style={{width: '700px', height: '700px'}} 
              speed="1"
              loop={false}
              autoplay>
            </dotlottie-wc>
          </div>
          
          <div className="about-content">
            <p className="about-subtitle">About Us</p>
            <BlurText
              text="Transforming Ideas into Digital Reality"
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="about-title"
            />
            <p className="about-description">
              AI Canvas revolutionizes how you interact with artificial intelligence. 
              Our multimodal platform combines the power of text, voice, and visual input 
              to create an intuitive and immersive AI experience.
            </p>
            
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">AI Models</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10000+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">User Satisfaction</div>
              </div>
            </div>
            
            <div className="about-signature">
              <div className="signature-name">Alex Johnson</div>
              <div className="signature-title">Alex Johnson • Founder & CEO</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <p className="features-subtitle">Our Features</p>
            <h2 className="features-title">
              Powerful AI Capabilities<br />
              at Your <span className="features-highlight">Fingertips</span>
            </h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-card">
                <div className="card-image" style={{backgroundImage: "url('Tiny people near phone with voice assistant on screen.jpg')"}}></div>
              </div>
              <h3 className="card-title-below">Voice Interaction</h3>
            </div>

            <div className="feature-item">
              <div className="feature-card">
                <div className="card-image" style={{backgroundImage: "url('13038.jpg')"}}></div>
              </div>
              <h3 className="card-title-below">Canvas Drawing</h3>
            </div>

            <div className="feature-item">
              <div className="feature-card">
                <div className="card-image" style={{backgroundImage: "url('20945879.jpg')"}}></div>
              </div>
              <h3 className="card-title-below">Text Chat</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
