import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LoginModal({ isOpen, isClose, closeModal, SwicthToRegister, SwicthToResetPass, setStatusLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errormessage, setMessage] = useState(null);
  const [isVisible, setisVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (username !== '' && password !== '') {
      setMessage(null);
    }
  }, [username, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (username === '' || password === '') {
      setMessage('Masukkan email dan password');
      setLoading(false);
    } else {
      
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/login`,{
        email: username,
        password: password
      })
      if (response) {
        setStatusLogin(true);
        setPassword('');
        setUsername('');
        setLoading(false);
        closeModal();
        window.location.reload();
        console.log(response);
        try {
          const data = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/me`,{
            withCredentials: true
          })
          if (data) {
            setStatusLogin(true)
            console.log(data)
          }
        } catch (error) {
          if (error.response.status === 401) {
              console.log(error.response.data.msg);
          }
        }
      }
    } catch (error) {
      if (error.response.status === 400) {
        console.log(error.response.data.msg);
        setMessage(error.response.data.msg);
        setLoading(false);
      }
    }
    }

  };

  const handleshowPass = (e) => {
    setisVisible(!isVisible)
  };

  return (

    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className={`modal-content ${isClose ? 'animasiDown' : 'animasiUp'}`}>
        <div className='cover-close'>
          <span className='text-bold text-size-14'>Login</span>
          <span className="close" onClick={closeModal}>&times;</span>
        </div>
        {errormessage !== null && (
          <span className='text-size-10 text-danger my-1'><i class="fa-solid fa-circle-info" style={{ marginRight: 5 }} /> {errormessage}</span>
        )}
        <form onSubmit={handleLogin} className='form py-1'>
          <div className='group-form'>
            <i className="fa-solid fa-envelope mx-right-1 text-default" />
            <input className='email' type="email" placeholder='Email' id="email" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className='group-form'>
            <i className="fas fa-key text-scondary mx-right-1 text-default" />
            <input type={`${isVisible ? 'text' : 'password'}`} placeholder='Password' id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <span onClick={handleshowPass}>
              {isVisible ? (
                <i className="far fa-eye text-secondary" />
              ) : (
                <i className="far fa-eye-slash text-secondary" />
              )}
            </span>
          </div>
          <div className='d-flex flex-row justify-content-end'>
            <span className='text-secondary text-size-10 my-1' onClick={SwicthToResetPass}>Lupa Password?</span>
          </div>
          <button className='button-form' type="submit" style={{backgroundColor : "#06647B" }}>Login
            {loading ? (
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
            ) : (
              <div></div>
            )}
          </button>
        </form>
        <div className='d-flex flex-row'>
          <span className='text-size-10' style={{ paddingRight: 3 }}>Belum punya akun?</span>
          <span className='text-default text-size-10' onClick={SwicthToRegister}>Daftar</span>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
