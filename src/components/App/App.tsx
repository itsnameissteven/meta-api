import React from 'react';
import './App.css';
import { getApis, Api } from '../../apiCalls';
import {CardContainer} from '../CardContainer/CardContainer';
import {FeaturedCard} from '../FeaturedCard/FeaturedCard';
import {FilterForm} from '../FilterForm/FilterForm';
import { FilterState } from '../FilterForm/FilterForm';
import { Note } from '../Note/Note';
import {Route} from 'react-router-dom';
import { SideBar } from '../SideBar/SideBar';
import { filterByCategory, filterByAuth, filterBySearch, filterByHTTPS, filterByCors } from '../../filterMethods'

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

  filter = (stateObj: FilterState): Api[] => {
    let matchedCards = this.state.apiList
    matchedCards = filterByCategory(matchedCards, stateObj)
    matchedCards = filterBySearch(matchedCards, stateObj)
    matchedCards = filterByAuth(matchedCards, stateObj)
    matchedCards = filterByHTTPS(matchedCards, stateObj)
    matchedCards = filterByCors(matchedCards, stateObj)
    this.setState({ currentApis: matchedCards })
    return matchedCards
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
        <SideBar apiList={this.state.favorites}></SideBar>
        <Route exact path='/' render={() => {
          return <main><h1>metAPI</h1>
          <FilterForm filter={this.filter} apiList={this.state.apiList}/>
          {this.state.currentApis.length > 0? <CardContainer apiList={this.state.currentApis}></CardContainer> : <p>Sorry No Apis available</p>}
          </main>
        }}/>
        <Route
          path="/:title"
          render={({ match }) => {
            const data = this.state.apiList.find((api) => api.API === match.params.title);
            if (data) {
              const myNotes = this.state.savedNotes.find(savedNote => savedNote.name === data.API)
              const savedNotes = myNotes?.notes.map(note => <Note note={note}/>)
              return (
                <main>
                  <FeaturedCard {...data} addToFavorites={this.addToFavorites} saveNote={this.saveNote}/>
                  <section className='saved-notes'>
                    {savedNotes}
                  </section>
                </main>
              );
            }
          }}
        />
      </div>
    );
  }
}

export default App;
