import { useState, useEffect } from 'react';
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

const App = () => {
  const [frontend, setFrontend] = useState('');
  const [backend, setBackend] = useState('');
  const [deployment, setDeployment] = useState('');
  const [vercelApiKey, setVercelApiKey] = useState('');
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
        deployment: deployment || null,
        vercelApiKey: vercelApiKey || null
      });
      alert('Project details submitted successfully');
    } catch (error) {
      console.error(error);
      alert('An error occurred while submitting project details');
    }
  };


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
                <div className="form-final-div form-final-div1">
                  <label>Enter Your <a href="https://vercel.com/account/tokens">Vercel API Key</a></label>
                  <input 
                    type="text" 
                    value={vercelApiKey} 
                    onChange={(e) => setVercelApiKey(e.target.value)} 
                    className="vercel-api-key-input"
                  />
                </div>
                <div className="form-final-div">
                  <label>Once this is done, create your project!</label>
                  <button 
                    type="button"
                    onClick={async () => {
                        if (!vercelApiKey) {
                            alert('Please enter your Vercel API key.');
                            return;
                        }
                        // Post Request w all project details & API key
                        await axios.post('/send-project-details', {
                            frontend: frontend || null,
                            backend: backend || null,
                            vercelApiKey: vercelApiKey || null
                            });
                        window.location.replace('/oauth/github');
                    }}
                    className="github-login">
                      Log into Github
                  </button>
                </div>
              </div>
            )}
            <div className="form-navigation">
              {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
              {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
              {/* {step === 3 && <button type="button" onClick={submitProjectData}>Submit</button>} */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;