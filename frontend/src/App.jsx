import { useState } from 'react'
import './App.css'
import axios from 'axios'
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

  const handleSelection = (type, value) => {
    if (type === 'frontend') setFrontend(frontend === value ? '' : value)
    if (type === 'backend') setBackend(backend === value ? '' : value)
    if (type === 'deployment') setDeployment(deployment === value ? '' : value)
  }

  const submitProjectData = async () => {
    try {
      await axios.post('http://localhost:4000/send-project-details', {
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