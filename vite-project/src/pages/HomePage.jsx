import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Link } from 'react-router-dom'

const HomePage = () => {

  return (
    <>
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
            <h2 className="about-title">Transforming Ideas into Digital Reality</h2>
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
                <div className="card-image" style={{backgroundImage: "url('Pic1.jpeg')"}}></div>
              </div>
              <h3 className="card-title-below">Voice Interaction</h3>
            </div>

            <div className="feature-item">
              <div className="feature-card">
                <div className="card-image" style={{backgroundImage: "url('PIc2.jpeg')"}}></div>
              </div>
              <h3 className="card-title-below">Canvas Drawing</h3>
            </div>

            <div className="feature-item">
              <div className="feature-card">
                <div className="card-image" style={{backgroundImage: "url('Pic 3.jpeg')"}}></div>
              </div>
              <h3 className="card-title-below">Text Chat</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Subscribe to our newsletter</h2>
            <div className="newsletter-form">
              <input type="text" placeholder="First name" className="newsletter-input" />
              <input type="email" placeholder="Email address" className="newsletter-input" />
              <button className="newsletter-btn">Subscribe Now</button>
            </div>
          </div>
          <div className="newsletter-decoration">
            <svg className="decoration-curve" viewBox="0 0 200 200" fill="none">
              <path d="M20 180 Q100 20 180 180" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#E0755F"/>
                    <path d="M12 10h8v2h-8v-2zm0 4h8v2h-8v-2zm0 4h6v2h-6v-2z" fill="white"/>
                  </svg>
                </div>
                <span className="footer-logo-text">AI Canvas</span>
              </div>
              <p className="footer-description">
                AI Canvas gives you the blocks and components you need to create 
                a truly professional AI interaction website.
              </p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h3 className="footer-column-title">COMPANY</h3>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link">About</a></li>
                  <li><a href="#" className="footer-link">Features</a></li>
                  <li><a href="#" className="footer-link">Works</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3 className="footer-column-title">HELP</h3>
                <ul className="footer-links-list">
                  <li><Link to="/faq" className="footer-link">FAQ</Link></li>
                  <li><a href="#" className="footer-link">Contact</a></li>
                  <li><a href="#" className="footer-link">Support</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3 className="footer-column-title">RESOURCES</h3>
                <ul className="footer-links-list">
                  <li><a href="#" className="footer-link">Blog</a></li>
                  <li><a href="#" className="footer-link">Newsletter</a></li>
                  <li><a href="#" className="footer-link">Events</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-copyright">
                © 2024 AI Canvas. All rights reserved.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social-link">Twitter</a>
                <a href="#" className="footer-social-link">LinkedIn</a>
                <a href="#" className="footer-social-link">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default HomePage 