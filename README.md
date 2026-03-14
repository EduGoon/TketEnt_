# TketEnt 🎪

A modern, full-featured event management and ticketing platform built for Kenya's vibrant event scene. Experience seamless event discovery, secure ticket purchasing, and comprehensive admin management.

## ✨ Features

### 🎫 **For Event Attendees**
- **Browse Events**: Discover events across multiple categories (Music, Technology, Arts, Sports, Food)
- **Secure Purchasing**: Buy tickets with multiple pricing tiers (General, VIP, Premium)
- **Account Management**: View purchase history and manage tickets
- **Responsive Design**: Optimized for all devices

### 👨‍💼 **For Event Organizers**
- **Admin Dashboard**: Full CRUD operations for events and sponsors
- **Analytics**: Comprehensive insights and reporting
- **Role-Based Access**: Secure admin authentication
- **Real-time Management**: Live event and ticket management

### 🎨 **Technical Features**
- **Demo Mode**: Showcase functionality without authentication
- **Local Storage**: Persistent data across sessions
- **Modern UI**: Beautiful, Kenyan-themed design
- **Type-Safe**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Data Persistence**: LocalStorage (demo) / Firebase (production)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TketEnt.git
   cd TketEnt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 📱 Usage

### Demo Mode (No Login Required)
- Visit `/account` or `/admin` directly to see full functionality
- Purchase tickets and view them in your account
- Explore admin features without authentication

### Full Experience
- **Sign up** with any email/password
- **Admin access**: Use `admin@TketEnt.com` / `password`
- **Browse events** and purchase tickets
- **Manage account** and view ticket history

## 📂 Project Structure

```
TketEnt/
├── src/
│   ├── components/          # Reusable UI components
│   ├── layouts/            # Layout components
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin-specific pages
│   │   └── ...             # Public pages
│   ├── services/           # Data services & mock data
│   ├── utilities/          # Helper functions & context
│   └── ...
├── public/                 # Static assets
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Styling configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Build configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔮 Future Integration

This demo is designed for seamless backend integration:

- **Authentication**: Firebase Auth
- **Database**: Firestore
- **File Storage**: Firebase Storage
- **Payments**: Stripe/PayPal
- **Hosting**: Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Images**: [Unsplash](https://unsplash.com) for beautiful stock photos
- **Icons**: Heroicons for consistent iconography
- **Colors**: Inspired by Kenya's vibrant culture

---