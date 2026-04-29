export const getUserRole = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.role;
  } catch (e) {
    return null;
  }
};