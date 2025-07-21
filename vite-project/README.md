# AI Canvas - Multimodal AI Interaction Platform

A beautiful, modern landing page and authentication system for AI Canvas, featuring multimodal AI interactions through text, voice, and drawing.

## ✨ Features

### **🎨 Beautiful Landing Page**
- Modern, responsive design with warm color palette
- Interactive Lottie animations
- Feature showcase with custom image cards
- Newsletter subscription
- Professional footer with links

### **🔐 Complete Authentication System**
- **Supabase Integration** - Secure, scalable authentication
- **Beautiful Login/Signup Pages** - Split-screen design with brand showcase
- **Form Validation** - Client-side validation with error handling
- **Email Confirmation** - Secure account verification flow
- **Dynamic Navigation** - Changes based on authentication state

### **📱 Routing & Navigation**
- **React Router** - Clean, bookmarkable URLs
- **Dedicated Pages** - Login (`/login`), Signup (`/signup`), FAQ (`/faq`)
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Complete dark theme support

### **❓ FAQ System**
- **Dedicated FAQ Page** - Professional, SEO-friendly
- **Accordion Interface** - Smooth expand/collapse animations
- **Contact Support** - Clear call-to-action buttons
- **Mobile Optimized** - Perfect on all devices

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd vite-project
npm install
```

### 2. Set Up Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure Supabase
In your Supabase dashboard:
- Go to **Authentication > Settings**
- Set Site URL: `http://localhost:5173` (for development)
- Enable email confirmations

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your site!

## 📖 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with features, about, and newsletter |
| `/login` | User login with email/password |
| `/signup` | Account creation with username, email, password |
| `/faq` | Frequently asked questions |

## 🎯 Navigation Logic

### **Not Logged In**
- Navbar: Home, FAQ
- Button: "Sign In" (redirects to `/login`)

### **Logged In**
- Navbar: Home, FAQ, Dashboard
- User menu: Greeting + "Sign Out" button

## 🎨 Design System

### **Colors**
- **Primary**: `#E0755F` (warm orange)
- **Secondary**: `#F4A261` (light orange)
- **Dark**: `#3D2C2E` (dark brown)
- **Background**: `#FAF4E5` (cream)

### **Fonts**
- **Headlines**: Patrick Hand (cursive)
- **Body**: Winky Rough (sans-serif)

### **Components**
- Modern rounded buttons with gradients
- Smooth hover animations
- Glass-morphism effects on navigation
- Professional form styling

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🔧 Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Authentication**: Supabase
- **Animations**: Lottie (dotlottie-react)
- **Styling**: CSS3 with custom properties
- **Icons**: Custom SVG components

## 📁 Project Structure

```
vite-project/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Switch.jsx       # Dark mode toggle
│   │   └── FAQ.jsx          # FAQ modal (legacy)
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── LoginPage.jsx    # Authentication login
│   │   ├── SignupPage.jsx   # User registration
│   │   └── FAQPage.jsx      # FAQ page
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication state
│   ├── lib/                 # Utilities
│   │   └── supabase.js      # Supabase client
│   ├── App.jsx              # Main app component
│   └── App.css              # Global styles
├── public/                  # Static assets
│   ├── Pic1.jpeg           # Feature card images
│   ├── PIc2.jpeg
│   └── Pic 3.jpeg
└── .env.example            # Environment variables template
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Add environment variables
3. Deploy!

### Supabase Production Setup
1. Update Site URL in Supabase settings
2. Configure email templates
3. Set up custom domains (optional)

## 🎯 Future Enhancements

- [ ] Dashboard page for logged-in users
- [ ] Email template customization
- [ ] Social authentication (Google, GitHub)
- [ ] User profile management
- [ ] Password reset functionality
- [ ] Admin panel
- [ ] Analytics integration

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**AI Canvas** - Experience the magic of multimodal AI interaction! 🎨✨
