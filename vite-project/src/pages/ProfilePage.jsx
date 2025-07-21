import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Main Profile Content */}
        <div className="profile-content">
          {/* Left Side - Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <img 
                  src="/Pic1.jpeg" 
                  alt="Profile Picture" 
                  className="avatar-image"
                />
              </div>
              <h2 className="profile-name">{user?.user_metadata?.username || user?.email || 'User'}</h2>
              <span className="premium-badge">Premium User</span>
            </div>
          </div>

          {/* Right Side - Bio & Details */}
          <div className="bio-section">
            <h3 className="bio-title">Bio & other details</h3>
            <div className="availability-indicator">
              <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">My Role</span>
                <span className="detail-value">Beatmaker</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">My Experience Level</span>
                <span className="detail-value">Intermediate</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">My 3 Favorite Artists</span>
                <span className="detail-value">Ninho, Travis Scott, Metro Boomin</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">My Favorite Music Genre</span>
                <span className="detail-value">Trap</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">The Software or Equipment I Use</span>
                <span className="detail-value">Ableton</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">My Preferred Music Mood</span>
                <span className="detail-value">Melancholic</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">My City or Region</span>
                <span className="detail-value">California, USA</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Availability</span>
                <span className="detail-value availability-status">
                  <span className="availability-dot"></span>
                  Available for Collaboration
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Badges</span>
                <span className="detail-value">
                  <span className="badge">🏆 Top Collaborator</span>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Tags</span>
                <div className="tags-container">
                  <span className="tag">#Drill</span>
                  <span className="tag">#Melancholic</span>
                  <span className="tag">#Rap-US</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="social-media-section">
          <h3 className="social-title">Social Media</h3>
          <div className="social-links">
            <a href="#" className="social-link youtube">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a2.972 2.972 0 0 0-2.089-2.1C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.409.541A2.972 2.972 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.972 2.972 0 0 0 2.089 2.1C4.495 20.455 12 20.455 12 20.455s7.505 0 9.409-.541a2.972 2.972 0 0 0 2.089-2.1C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" className="social-link instagram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="social-link tiktok">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 