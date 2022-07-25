import { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import Login from './Login';
import Register from './Register';
import Header from './Header';
import Main from './Main';
import ImagePopup from './ImagePopup';
import api from '../utils/Api';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import InfoTooltip from './InfoTooltip';
import ProtectedRoute from './ProtectedRoute';
import * as auth from '../utils/auth';
import union from '../images/Union.svg';
import unionError from '../images/Union-error.svg';

function App() {
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  const history = useHistory();

  useEffect(() => {
    checkToken()
  }, []);

  useEffect(() => {
    if (loggedIn) {
      api.getUserInfo()
      .then((userData) => {
        setCurrentUser(userData);
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
      api.getCards()
      .then((cardData) => {
        setCards(cardData.map((card) =>({...card, key: card._id})));
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
    }
  }, [loggedIn]);

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
    setIsInfoTooltipPopupOpen(false);
  }

  function handleUpdateUser(userData) {
    api.editUserInfo(userData)
      .then((userData) => {
        setCurrentUser(userData)
        closeAllPopups(setIsEditProfilePopupOpen)
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
  }

  function handleUpdateAvatar(link) {
    api.editUserAvatar(link)
      .then((link) => {
        setCurrentUser(link)
        closeAllPopups(setIsEditAvatarPopupOpen)
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api.changeCardLike(card._id, !isLiked)
    .then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    })
    .catch((error) => {
      console.log(`ERROR: ${error}`);
    });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== card._id));
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
  }

  function handleAddPlaceSubmit(newCardData) {
    api.createCard(newCardData)
      .then((newCard) => {
        setCards([newCard, ...cards])
        closeAllPopups(setIsAddPlacePopupOpen)
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
  }

  function onLogin({email, password}) {
    auth.authorize(email, password)
    .then((res) => {
      if (res.token) {
        localStorage.setItem('token', res.token);
        setLoggedIn(true);
        setEmail(email);
        history.push('/');
      }
    })
    .catch ((error) => {
      console.log(`ERROR: ${error}`);
    })
  }

  function onRegister({email, password}) {
    auth.register(email, password)
    .then((res) => {
      if (res) {
        setIsInfoTooltipPopupOpen(true);
        setMessage('Вы успешно зарегестрировались!');
        setImage(union);
        history.push('/sign-in');
      } else {
        setIsInfoTooltipPopupOpen(true);
        setMessage('Что-то пошло не так! Попробуйте еще раз.');
        setImage(unionError);
      }
    })
    .catch((error) => {
      console.log(`ERROR: ${error}`);
    });
  }

  function handleSignOut() {
    localStorage.removeItem('token');
    setEmail('');
    history.push('/sign-in');
    setLoggedIn(false);
  }

  function checkToken() {
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      auth.getContent(token)
      .then((res) => {
        if (res) {
          const email = res.data.email
          setLoggedIn(true);
          setEmail(email);
        }
        history.push('/')
      })
      .catch ((error) => {
        console.log(`ERROR: ${error}`);
      })
    }
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header
          email = {email}
          loggedIn = {loggedIn}
          onSignOut = {handleSignOut}
        />
        <Switch>
          <Route exact={true} path="/sign-up">
            <Register
              onRegister={onRegister}
            />
          </Route>
          <Route exact={true} path="/sign-in">
            <Login
              onLogin={onLogin}
            />
          </Route>
          <ProtectedRoute
            exact={true}
            path="/"
            component={Main}
            loggedIn={loggedIn}
            onEditAvatar = {setIsEditAvatarPopupOpen}
            onEditProfile = {setIsEditProfilePopupOpen}
            onAddPlace = {setIsAddPlacePopupOpen}
            cards={cards}
            onCardClick = {setSelectedCard}
            onCardLike = {handleCardLike}
            onCardDelete = {handleCardDelete}
          >
          </ProtectedRoute>
        </Switch>
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        />
        <ImagePopup
          card = {selectedCard}
          onClose = {closeAllPopups}
        />
        <InfoTooltip
          isOpen={isInfoTooltipPopupOpen}
          onCLose={closeAllPopups}
          image={image}
          message={message}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
