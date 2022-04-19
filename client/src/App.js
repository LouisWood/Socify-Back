import { useEffect, useState } from 'react';
import { logoutCurrentUser } from './scripts/user'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { GlobalStyle } from './styles';
import styled from 'styled-components/macro';
import { Login, Profile, TopArtists, TopTracks, Playlists, Playlist, Messages } from './pages';


/**
 * Forcer les pages à s'afficher à partir du haut
 * (le comportement de base fait qu'elle s'affiche en étant tout en bas)
 * https://www.kindacode.com/article/react-router-dom-scroll-to-top-on-route-change/
 * @returns null
 */
function ScrollToTop() {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo(0,0);
  }, [pathname]);

  return null;
}

const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0,0,0,.7);
  color: var(--white);
  font-size: var(--fsize-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

function App() {
  const [token, setToken] = useState(false);

  useEffect(() => {
    setToken(document.cookie.indexOf('userID=') !== -1 ? true : false);
  }, []);

  /**
   * Setup React Routes avec react-router-dom
   * https://stackoverflow.com/questions/69975792/error-home-is-not-a-route-component-all-component-children-of-routes-mus
   */
  return (
    <div className="App">
      <GlobalStyle/>
      <header className="App-header">
        {!token ? (
          <Login/>
        ) : (
            <>
              <StyledLogoutButton onClick={logoutCurrentUser}>Se déconnecter</StyledLogoutButton>
              <Router>
                <ScrollToTop />
                <Routes>
                  <Route path="/top-artists" element={<TopArtists/>} />
                  <Route path="/top-tracks" element={<TopTracks/>} />
                  <Route path="/playlists/:id" element={<Playlist/>} />
                  <Route path="/playlists" element={<Playlists/>} />
                  <Route path="/messages" element={<Messages/>}/>
                  <Route path="/" element={<Profile />}>
                  </Route>
                </Routes>
            </Router>
            </>)
        }
      </header>
    </div>
  );
}

export default App;
