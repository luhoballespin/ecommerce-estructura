import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const CartDebug = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user?.user);
  const isAuthenticated = useSelector(state => state?.user?.isAuthenticated);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const token = localStorage.getItem('token');
  const userFromStorage = localStorage.getItem('user');
  let parsedUserFromStorage = null;

  try {
    parsedUserFromStorage = userFromStorage ? JSON.parse(userFromStorage) : null;
  } catch (error) {
    console.error('Error parsing user from storage:', error);
  }

  const forceLoadUser = () => {
    if (parsedUserFromStorage) {
      console.log('Force loading user from storage:', parsedUserFromStorage);
      dispatch(setUserDetails(parsedUserFromStorage));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      maxWidth: '350px'
    }}>
      <h4>Cart Debug</h4>
      <div>Token: {token ? '✅' : '❌'} ({token ? token.length : 0})</div>
      <div>Redux User ID: {user?._id || 'null'}</div>
      <div>Redux User Name: {user?.name || 'null'}</div>
      <div>Redux Auth: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Storage User: {parsedUserFromStorage?.name || 'null'}</div>
      <div>Storage User ID: {parsedUserFromStorage?._id || 'null'}</div>
      <div>Auth Check: {token || user?._id ? '✅' : '❌'}</div>
      {parsedUserFromStorage && !user?._id && (
        <button
          onClick={forceLoadUser}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer',
            marginTop: '5px'
          }}
        >
          Force Load User
        </button>
      )}
    </div>
  );
};

export default CartDebug;
