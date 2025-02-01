import { useState } from 'react'
import './App.css'

function App() {
  const [frontend, setFrontend] = useState('')
  const [backend, setBackend] = useState('')
  const [deployment, setDeployment] = useState('')
  const [step, setStep] = useState(1)

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)
  
  const handleGitHubLogin = async () => {
    window.location.replace(`http://localhost:4000/oauth/github`)
  }

  const options = {
    frontend: ['React', 'Vue', 'Angular'],
    backend: ['Node.js', 'Django', 'Flask'],
    deployment: ['Vercel', 'Netlify', 'Heroku']
  }


  const handleSelection = (type, value) => {
    if (type === 'frontend') setFrontend(value)
    if (type === 'backend') setBackend(value)
    if (type === 'deployment') setDeployment(value)
  }

  return (
    <div className="app-container">
      <h1>Project Setup</h1>
      <button 
        type="button"
        onClick={handleGitHubLogin}
        className="github-login" >
        Login with GitHub
      </button>
      <form className="form">
        {step === 1 && (
           <div className="form-group">
             <label>Frontend</label>
             <div className="options">
               {options.frontend.map(option => (
                 <div
                   key={option}
                   className={`option ${frontend === option ? 'selected' : ''}`}
                   onClick={() => handleSelection('frontend', option)}
                 >
                   {option}
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
                   key={option}
                   className={`option ${backend === option ? 'selected' : ''}`}
                   onClick={() => handleSelection('backend', option)}
                 >
                   {option}
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
                   key={option}
                   className={`option ${deployment === option ? 'selected' : ''}`}
                   onClick={() => handleSelection('deployment', option)}
                 >
                   {option}
                 </div>
               ))}
             </div>
           </div>
         )}
         <div className="form-navigation">
           {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
           {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
           {step === 3 && <button type="submit">Submit</button>}
         </div>

      </form>
    </div>
  )
}

export default App;