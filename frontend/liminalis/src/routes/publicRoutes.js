import Home from '../pages/Home';
import PrivacyPage from '../pages/infoPages/Privacy';
import AboutPage from '../pages/infoPages/AboutPage';
import ContactPage from '../pages/infoPages/ContactPage';
import OurStackPage from '../pages/infoPages/OurStackPage';
import UserProfile from '../pages/UserProfile';
import SearchPage from '../pages/SearchPage';
import Feed from '../pages/Feed';
import PostView from '../pages/PostView';
import FollowList from '../pages/FollowList';

export const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/tech-stack', element: <OurStackPage /> },
  { path: '/profile/:slug', element: <UserProfile /> },
  { path: '/profile/:slug/followers', element: <FollowList type="followers" /> },
  { path: '/profile/:slug/following', element: <FollowList type="following" /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/feed', element: <Feed /> },
  { path: '/posts/:id', element: <PostView /> },
];