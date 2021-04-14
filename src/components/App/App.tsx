import React from "react";
import "./App.css";
import { getApis, Api } from "../../apiCalls";
import { CardContainer } from "../CardContainer/CardContainer";
import { FeaturedCard } from "../FeaturedCard/FeaturedCard";
import { FilterForm } from "../FilterForm/FilterForm";
import { FilterState } from "../FilterForm/FilterForm";
import { Note } from '../Note/Note';
import { Route } from "react-router-dom";
import { getEnabledCategories } from "node:trace_events";
import { isCompositeComponentWithType } from "react-dom/test-utils";
import { ApiCard } from "../ApiCard/ApiCard";

type Props = {};
type Notes = {
  name: string,
  notes: string[]
}

class App extends React.Component<Props> {
  state: {
    apiList: Api[];
    currentApis: Api[];
    favorites: Api[];
    savedNotes: Notes[]
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      apiList: [],
      currentApis: [],
      favorites: [],
      savedNotes: []
    };
  }

  componentDidMount() {
    getApis().then((data) => this.setState({ apiList: data.entries, currentApis: data.entries }));
    const myFavorites = localStorage.getItem('favorites');
    const myNotes = localStorage.getItem('notes');
    myFavorites && this.setState({favorites: JSON.parse(myFavorites)});
    myNotes && this.setState({savedNotes: JSON.parse(myNotes)});
  }

  filter = (stateObj: FilterState): any => {
    let matchingCards: Api[] = [];
    matchingCards = this.state.apiList.filter((api) => {
      return api.API.includes(stateObj.search);
    });
    stateObj.Categories &&
      (matchingCards = matchingCards.filter((api) => {
        return api.Category === stateObj.Categories;
      }));

    stateObj.Auth !== "Empty" &&
      (matchingCards = matchingCards.filter((api) => {
        return api.Auth.toLowerCase() === stateObj.Auth.toLowerCase();
      }));

    stateObj.HTTPS !== "" &&
      (matchingCards = matchingCards.filter((api) => {
        return api.HTTPS === stateObj.HTTPS;
      }));

    stateObj.Cors !== "" &&
      (matchingCards = matchingCards.filter((api) => {
        return api.Cors.toLowerCase() === stateObj.Cors.toLowerCase();
      }));

    if (matchingCards.length) {
      this.setState({ ...this.state, currentApis: matchingCards });
      return matchingCards;
    } else return this.state.apiList;
  };

  addToFavorites = (ApiCard: Api) => {
    const alreadySaved = this.state.favorites.some((element) => element.API === ApiCard.API);
    !alreadySaved && this.setState({ favorites: [...this.state.favorites, ApiCard] });
  };

  saveNote = (ApiName: string, note: string) => {
    if(!note) return null;
    const hasSavedNotes = this.state.savedNotes.some(note => note.name === ApiName);
    if(hasSavedNotes) {
      const updatedNotes = this.state.savedNotes.map( savedNote => {
        if(savedNote.name === ApiName) {
          savedNote.notes.push(note);
        }
        return savedNote;
      });
      return this.setState({ savedNotes: updatedNotes});
    } 
    this.setState({ savedNotes: [...this.state.savedNotes, {name: ApiName, notes: [note]}]});
  }

  render() {
    this.state.favorites.length && localStorage.setItem('favorites', JSON.stringify(this.state.favorites));
    this.state.savedNotes.length && localStorage.setItem('notes', JSON.stringify(this.state.savedNotes));
    return (
      <div className="App">
        <FilterForm filter={this.filter} apiList={this.state.apiList} />
        <Route
          exact
          path="/"
          render={() => {
            return (
              <CardContainer apiList={this.state.currentApis}></CardContainer>
            );
          }}
        />
        <Route
          path="/:title"
          render={({ match }) => {
            const data = this.state.apiList.find((api) => api.API === match.params.title);
            if (data) {
              const myNotes = this.state.savedNotes.find(savedNote => savedNote.name === data.API)
              const savedNotes = myNotes?.notes.map(note => <Note note={note}/>)
              return (
                <>
                  <FeaturedCard {...data} addToFavorites={this.addToFavorites} saveNote={this.saveNote}/>
                  <section className='saved-notes'>
                    {savedNotes}
                  </section>
                </>
              );
            }
          }}
        />
      </div>
    );
  }
}

export default App;
