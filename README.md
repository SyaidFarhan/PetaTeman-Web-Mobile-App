# Peta - Social Location Sharing App

A real-time friend location sharing, map pins, and split bills application built with Go backend and React frontend.

## 📋 Features

- **Real-time Location Sharing**: Share and view friends' locations in real-time
- **Map Pins**: Create and view pins on an interactive map
- **Split Bills**: Easy bill splitting with friends
- **Friendship Management**: Connect and manage friendships
- **PWA Support**: Install as a progressive web app
- **WebSocket Support**: Real-time updates and communication

## 🛠️ Tech Stack

### Backend
- **Language**: Go 1.22.2
- **Framework**: Fiber v2
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT
- **WebSocket**: Fiber WebSocket

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.7
- **State Management**: React Hooks
- **Styling**: CSS
- **Mapping**: Leaflet + React Leaflet
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7.1.5
- **Backend**: Supabase

## 📦 Project Structure

```
projectsyaid/
├── backend/                 # Go backend
│   ├── cmd/server/         # Entry point
│   ├── config/             # Configuration
│   ├── internal/
│   │   ├── handler/        # API handlers
│   │   ├── middleware/     # JWT middleware
│   │   ├── models/         # Data models
│   │   ├── repository/     # Database access
│   │   ├── router/         # Route definitions
│   │   └── service/        # Business logic
│   ├── go.mod
│   └── schema.sql          # Database schema
│
└── frontend/               # React frontend
    ├── src/
    │   ├── api/            # API clients
    │   ├── components/     # React components
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Page components
    │   ├── styles/         # Global styles
    │   └── utils/          # Utility functions
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Go 1.22.2+
- Node.js 18+
- npm or yarn
- PostgreSQL (or Supabase account)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
go mod download
```

4. Run the server:
```bash
go run cmd/server/main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API and Supabase URLs

4. Install dependencies:
```bash
npm install
```

5. Start development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Environment Variables

### Backend
Create `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/peta
JWT_SECRET=your_jwt_secret_here
PORT=8080
```

### Frontend
Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WS_URL=ws://localhost:8080
```

## 📝 Available Scripts

### Backend
```bash
go run cmd/server/main.go    # Run server
go test ./...                # Run tests
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌐 Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Visit https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Backend Deployment
Can be deployed to:
- Railway
- Heroku
- DigitalOcean
- AWS
- Google Cloud
- Azure

## 📚 API Endpoints

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends` - Add friend
- `DELETE /api/friends/:id` - Remove friend

### Locations
- `POST /api/locations` - Share location
- `GET /api/locations` - Get friend locations

### Pins
- `GET /api/pins` - Get all pins
- `POST /api/pins` - Create pin
- `DELETE /api/pins/:id` - Delete pin

### Split Bills
- `GET /api/split-bills` - Get split bills
- `POST /api/split-bills` - Create split bill
- `PUT /api/split-bills/:id/settle` - Settle bill

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Syaid Farhan** - Initial work

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.
