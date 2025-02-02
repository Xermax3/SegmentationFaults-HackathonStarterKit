import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import vueLogo from './assets/vue.svg';
import angularLogo from './assets/angular.svg';
import nodeLogo from './assets/node.svg';
import djangoLogo from './assets/django.svg';
import flaskLogo from './assets/flask.svg';
import vercelLogo from './assets/vercel.svg';
import netlifyLogo from './assets/netlify.svg';
import herokuLogo from './assets/heroku.svg';
import SplitText from "./SplitText.jsx";
import queryString from 'query-string';

const App = () => {
  const [frontend, setFrontend] = useState('');
  const [backend, setBackend] = useState('');
  const [deployment, setDeployment] = useState('');
  const [step, setStep] = useState(0); // Initialize step to 0 to show the new section first
  const [fade, setFade] = useState(true); // State to manage fade transition
  const fadeDuration = 400;

  useEffect(() => {
    const handleMouseMove = (event) => {
      const glow = document.querySelector('.glow');
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleGetStarted = () => {
    setFade(false); // Start fade-out transition
    setTimeout(() => {
      setStep(1); // Set step to 1 to show the form
      setFade(true); // Start fade-in transition
    }, fadeDuration); // Match the duration of the CSS transition
  };

  const nextStep = () => {
    setFade(false); // Start fade-out transition
    setTimeout(() => {
      setStep(step + 1); // Move to the next step
      setFade(true); // Start fade-in transition
    }, fadeDuration); // Match the duration of the CSS transition
  };

  const prevStep = () => {
    setFade(false); // Start fade-out transition
    setTimeout(() => {
      setStep(step - 1); // Move to the previous step
      setFade(true); // Start fade-in transition
    }, fadeDuration); // Match the duration of the CSS transition
  };

  useEffect(() => {

    (async () => { 
      const { code, state } = queryString.parse(window.location.search);

      console.log(`code is ${code}`)
      console.log(`state is ${state}`)

      // validate the state parameter
      if (state !== localStorage.getItem("latestCSRFToken")){
        localStorage.removeItem("latestCSRFToken");
      } else {
        // send the code to the backend
        await axios.post("/api/oauth-token", {
          code
        });

      }
    })();
  }, [])

  const handleSelection = (type, value) => {
    if (type === 'frontend') setFrontend(frontend === value ? '' : value);
    if (type === 'backend') setBackend(backend === value ? '' : value);
    if (type === 'deployment') setDeployment(deployment === value ? '' : value);
  };

  const submitProjectData = async () => {
    try {
      await axios.post('/send-project-details', {
        frontend: frontend || null,
        backend: backend || null,
        deployment: deployment || null
      });
      alert('Project details submitted successfully');
    } catch (error) {
      console.error(error);
      alert('An error occurred while submitting project details');
    }
  };

  const handleGitHubLogin = async () => {
    window.location.replace('/oauth/github')
  }

  const handleVercelLogin = () => {
    // the integration URL slug from vercel
    const client_slug = "gitstack-vercel-auth"

    // create a CSRF token and store it locally
    const array = new Uint32Array(4)
    window.crypto.getRandomValues(array)
    const state = Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
    localStorage.setItem("latestCSRFToken", state)
        
    // redirect the user to vercel
    const link = `https://vercel.com/integrations/${client_slug}/new?state=${state}`
    window.location.assign(link)
  }

  const options = {
    frontend: [
      { name: 'React', logo: reactLogo },
      // { name: 'Vue', logo: vueLogo },
      { name: 'Angular', logo: angularLogo }
    ],
    backend: [
      { name: 'Node.js', logo: nodeLogo },
      // { name: 'Django', logo: djangoLogo },
      { name: 'Flask', logo: flaskLogo }
    ],
    // deployment: [
    //   { name: 'Vercel', logo: vercelLogo },
    //   { name: 'Netlify', logo: netlifyLogo },
    //   { name: 'Heroku', logo: herokuLogo }
    // ]
  };

  return (
    <div className={`app-container fade ${fade ? 'show' : ''}`}>
      <div className="glow"></div>
      {step === 0 ? (
        <div className="intro-section">
          <h1 className="large-title shiny-text">GitStack</h1>
          <h2 className="subtitle">
            <SplitText
              text="Deploy in a Click!"
              className="text-2xl font-semibold text-center subtitle"
              delay={120}
              animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
              animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
              easing="easeOutCubic"
              threshold={0.2}
              rootMargin="-50px"
            />
          </h2>
          
          <button 
            type="button"
            onClick={handleGetStarted}
            className="get-started-button">
              Get Started
          </button>
        </div>
      ) : (
        <>
          <h1>GitStack</h1>
          <div className="form">
            {step === 1 && (
              <div className="form-group">
                <label>Select a Frontend Framework</label>
                <div className="options">
                  {options.frontend.map(option => (
                    <div
                      key={option.name}
                      className={`option ${frontend === option.name ? 'selected' : ''}`}
                      onClick={() => handleSelection('frontend', option.name)}
                    >
                      <img src={option.logo} alt={option.name} className="logo" />
                      {option.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="form-group">
                <label>Select a Backend Framework</label>
                <div className="options">
                  {options.backend.map(option => (
                    <div
                      key={option.name}
                      className={`option ${backend === option.name ? 'selected' : ''}`}
                      onClick={() => handleSelection('backend', option.name)}
                    >
                      <img src={option.logo} alt={option.name} className="logo" draggable="false" />
                      {option.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* {step === 3 && (
              <div className="form-group">
                <label>Select a Deployment Framework</label>
                <div className="options">
                  {options.deployment.map(option => (
                    <div
                      key={option.name}
                      className={`option ${deployment === option.name ? 'selected' : ''}`}
                      onClick={() => handleSelection('deployment', option.name)}
                    >
                      <img src={option.logo} alt={option.name} className="logo" />
                      {option.name}
                    </div>
                  ))}
                </div>
              </div>
            )} */}
            {step === 3 && (
              <div className="form-group">
                <label>Grant access to GitHub to proceed</label>
                <button 
                  type="button"
                  onClick={handleGitHubLogin}
                  className="github-login">
                    Log into Github
                </button>
                <button 
                  type="button"
                  onClick={handleVercelLogin}
                  className="vercel-login">
                    Login with Vercel
                </button>
              </div>
            )}
            <div className="form-navigation">
              {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
              {step < 3 && <button type="button" onClick={nextStep}>Next</button>} {/* TODO Next appear once logged */}
              {step === 3 && <button type="button" onClick={submitProjectData}>Submit</button>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;