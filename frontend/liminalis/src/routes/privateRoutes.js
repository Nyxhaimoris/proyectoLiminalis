import PrivateRoute from '../components/guards/PrivateRoute';
import EditMyProfile from '../pages/EditMyProfile';
import Config from '../pages/Config';
import ChatPage from '../pages/chat/ChatPage';
import CreatePost from '../pages/CreatePost';
import ChatSettings from '../pages/chat/ChatSettings';
import CreateChatPage from '../pages/chat/CreateChatPage';
import ChatFinderPage from '../pages/chat/ChatFinderPage';
import ChatInvitationGate from "../pages/chat/ChatInvitationGate";

export const privateRoutes = [
    {
        path: '/editmyprofile',
        element: (
            <PrivateRoute>
                <EditMyProfile />
            </PrivateRoute>
        ),
    },
    {
        path: '/config',
        element: (
            <PrivateRoute>
                <Config />
            </PrivateRoute>
        ),
    },
    {
        path: '/chat/:id',
        element: (
            <PrivateRoute>
                <ChatPage />
            </PrivateRoute>
        ),
    },
    {
        path: '/posts/new',
        element: (
            <PrivateRoute>
                <CreatePost />
            </PrivateRoute>
        ),
    },
    {
        path: '/chats/new',
        element: (
            <PrivateRoute>
                <CreateChatPage />
            </PrivateRoute>
        ),
    },
    {
        path: '/chats/discover',
        element: (
            <PrivateRoute>
                <ChatFinderPage />
            </PrivateRoute>
        ),
    },
    {
        path: '/chat-invite/:chatId',
        element: (
            <PrivateRoute>
                <ChatInvitationGate />
            </PrivateRoute>
        ),
    },
    {
        path: '/chats/:id/settings',
        element: (
            <PrivateRoute>
                <ChatSettings />
            </PrivateRoute>
        ),
    }
];