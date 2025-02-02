import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import queryString from 'query-string'
import reactLogo from './assets/react.svg'
import vueLogo from './assets/vue.svg'
import angularLogo from './assets/angular.svg'
import nodeLogo from './assets/node.svg'
import djangoLogo from './assets/django.svg'
import flaskLogo from './assets/flask.svg'
import vercelLogo from './assets/vercel.svg'
import netlifyLogo from './assets/netlify.svg'
import herokuLogo from './assets/heroku.svg'

function App() {
  const [frontend, setFrontend] = useState('')
  const [backend, setBackend] = useState('')
  const [deployment, setDeployment] = useState('')
  const [step, setStep] = useState(1)

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  useEffect(async () => {
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
  }, [])

  const handleSelection = (type, value) => {
    if (type === 'frontend') setFrontend(frontend === value ? '' : value)
    if (type === 'backend') setBackend(backend === value ? '' : value)
    if (type === 'deployment') setDeployment(deployment === value ? '' : value)
  }

  const submitProjectData = async () => {
    try {
      await axios.post('/send-project-details', {
        frontend: frontend || null,
        backend: backend || null,
        deployment: deployment || null
      })
      alert('Project details submitted successfully')
    } catch (error) {
      console.error(error)
      alert('An error occurred while submitting project details')
    }
  }

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
      { name: 'Vue', logo: vueLogo },
      { name: 'Angular', logo: angularLogo }
    ],
    backend: [
      { name: 'Node.js', logo: nodeLogo },
      { name: 'Django', logo: djangoLogo },
      { name: 'Flask', logo: flaskLogo }
    ],
    deployment: [
      { name: 'Vercel', logo: vercelLogo },
      { name: 'Netlify', logo: netlifyLogo },
      { name: 'Heroku', logo: herokuLogo }
    ]
  }

  return (
    <div className="app-container">
      <h1>Project Setup</h1>
      <button 
        type="button"
        onClick={handleGitHubLogin}
        className="github-login">
          Login with Github
      </button>
      <button 
        type="button"
        onClick={handleVercelLogin}
        className="vercel-login">
          Login with Vercel
      </button>
      <div className="form">
        {step === 1 && (
          <div className="form-group">
            <label>Frontend</label>
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
            <label>Backend</label>
            <div className="options">
              {options.backend.map(option => (
                <div
                  key={option.name}
                  className={`option ${backend === option.name ? 'selected' : ''}`}
                  onClick={() => handleSelection('backend', option.name)}
                >
                  <img src={option.logo} alt={option.name} className="logo" />
                  {option.name}
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="form-group">
            <label>Deployment</label>
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
        )}
        <div className="form-navigation">
          {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
          {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
          {step === 3 && <button type="button" onClick={submitProjectData}>Submit</button>}
        </div>
      </div>
    </div>
  )
}

export default App