import { useState, useEffect } from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import api from '../utils/Api';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    api.getUserInfo()
      .then((userData) => {
        setCurrentUser(userData);
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
  }, []);

  useEffect(() =>{
    api.getCards()
      .then((cardData) => {
        setCards(cardData.map((card) =>({
          key: card._id,
          _id: card._id,
          link: card.link,
          name: card.name,
          likes: card.likes,
          owner: card.owner,
        })));
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
      });
  }, []);

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
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

    !isLiked ?
      api.setLike(card._id)
        .then((newCard) => {
          setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
        })
        .catch((error) => {
          console.log(`ERROR: ${error}`);
        })
      :
      api.removeLike(card._id)
        .then((newCard) => {
          setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
        })
        .catch((error) => {
          console.log(`ERROR: ${error}`);
        });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then((newCard) => {
        setCards((state) => state.filter((c) => c._id === card._id ? "" : newCard));
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

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header />
        <Main
          onEditAvatar = {setIsEditAvatarPopupOpen}
          onEditProfile = {setIsEditProfilePopupOpen}
          onAddPlace = {setIsAddPlacePopupOpen}
          cards={cards}
          onCardClick = {setSelectedCard}
          onCardLike = {handleCardLike}
          onCardDelete = {handleCardDelete}
        />
        <Footer />
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
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
