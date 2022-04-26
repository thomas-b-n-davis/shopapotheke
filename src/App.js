import logo from './logo.svg';
import './App.css';
import history from './history';
import Home from './pages/Home';
import {
  Router,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/" render={props=><Home {...props}/>}/>
      </Switch>
    </Router>
  );
}

export default App;
