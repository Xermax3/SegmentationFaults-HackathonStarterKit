import { useState } from 'react'
import './App.css'

function App() {
  const [frontend, setFrontend] = useState('')
  const [backend, setBackend] = useState('')
  const [deployment, setDeployment] = useState('')

  return (
    <div className="app-container">
      <h1>Project Setup</h1>
      <form className="form">
        <div className="form-group">
          <label htmlFor="frontend">Frontend</label>
          <select id="frontend" value={frontend} onChange={(e) => setFrontend(e.target.value)}>
            <option value="">Select Frontend</option>
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="backend">Backend</label>
          <select id="backend" value={backend} onChange={(e) => setBackend(e.target.value)}>
            <option value="">Select Backend</option>
            <option value="node">Node.js</option>
            <option value="django">Django</option>
            <option value="flask">Flask</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="deployment">Deployment</label>
          <select id="deployment" value={deployment} onChange={(e) => setDeployment(e.target.value)}>
            <option value="">Select Deployment</option>
            <option value="vercel">Vercel</option>
            <option value="netlify">Netlify</option>
            <option value="heroku">Heroku</option>
          </select>
        </div>
      </form>
    </div>
  )
}

export default App