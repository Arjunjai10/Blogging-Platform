import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TitleUpdater from './components/layout/TitleUpdater';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import PostDetails from './pages/PostDetails';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';
import Bookmarks from './pages/Bookmarks';
import Search from './pages/Search';
import Categories from './pages/Categories';
import NotificationDebug from './components/notifications/NotificationDebug';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPosts from './pages/AdminPosts';
import AdminComments from './pages/AdminComments';
import AdminNotifications from './pages/AdminNotifications';
import AdminSettings from './pages/AdminSettings';

// Context
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import PrivateRoute from './components/routing/PrivateRoute';
import PrivateAdminRoute from './components/routing/PrivateAdminRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000', // Changed from blue to black
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
});

function App() {
  // Set document title based on settings
  React.useEffect(() => {
    // Set default title
    document.title = 'Blog';
  }, []);
  
  return (
    <AuthProvider>
      <PostProvider>
        <NotificationProvider>
          <SettingsProvider>
            <TitleUpdater />
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Router>
              <div className="App">
                <Navbar />
                <div className="page-container">
                  <main className="content-wrap">
                    <div className="container">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/google/callback" element={<GoogleCallback />} />
                        <Route path="/posts/:id" element={<PostDetails />} />
                        <Route path="/create-post" element={
                          <PrivateRoute>
                            <CreatePost />
                          </PrivateRoute>
                        } />
                        <Route path="/edit-post/:id" element={
                          <PrivateRoute>
                            <EditPost />
                          </PrivateRoute>
                        } />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/edit-profile" element={
                          <PrivateRoute>
                            <EditProfile />
                          </PrivateRoute>
                        } />
                        <Route path="/bookmarks" element={
                          <PrivateRoute>
                            <Bookmarks />
                          </PrivateRoute>
                        } />
                        <Route path="/search" element={<Search />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/category/:category" element={<Categories />} />
                        <Route path="/notification-debug" element={<NotificationDebug />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={
                          <PrivateAdminRoute>
                            <AdminDashboard />
                          </PrivateAdminRoute>
                        } />
                        <Route path="/admin/users" element={
                          <PrivateAdminRoute>
                            <AdminUsers />
                          </PrivateAdminRoute>
                        } />
                        <Route path="/admin/posts" element={
                          <PrivateAdminRoute>
                            <AdminPosts />
                          </PrivateAdminRoute>
                        } />
                        <Route path="/admin/comments" element={
                          <PrivateAdminRoute>
                            <AdminComments />
                          </PrivateAdminRoute>
                        } />
                        <Route path="/admin/notifications" element={
                          <PrivateAdminRoute>
                            <AdminNotifications />
                          </PrivateAdminRoute>
                        } />
                        <Route path="/admin/settings" element={
                          <PrivateAdminRoute>
                            <AdminSettings />
                          </PrivateAdminRoute>
                        } />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </main>
                  <Footer />
                </div>
              </div>
              </Router>
            </ThemeProvider>
          </SettingsProvider>
        </NotificationProvider>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;
