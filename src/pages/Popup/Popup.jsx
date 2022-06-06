// src/pages/Popup/Popup.js

import React, { Component } from 'react';
import axios from 'axios';

// import { apiUserBase, tokenInvalidMessage } from '../../constants';
import style from '../../styles/App.css';

const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMonthName = date => months[date.getMonth()];

const dateToTitle = date => {
  const newDate = new Date(date);

  const day = days[newDate.getDay()];

  const month = getMonthName(newDate);

  const d = newDate.getDate();

  const year = newDate.getFullYear();

  return `${day} ${month} ${d}, ${year}`;
};

const getToday = () => new Date();

const getTodaysTitle = () => {
  const today = getToday();

  return dateToTitle(today);
};

class Popup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      loading: false,
      loggedIn: false,
      password: '',
      success: false,
      text: '',
      user: {},
      username: '',
    };

    this.addToToday = this.addToToday.bind(this);
    this.login = this.login.bind(this);
    this.saveState = this.saveState.bind(this);
  }

  componentDidMount() {
    chrome.storage.local.get(['twos'], result => {
      // console.log('result', result);
      this.setState({ ...(result.twos || {}), loading: false, success: false });

      chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        // use `url` here inside the callback because it's asynchronous!
        this.setState({ text: `${tabs[0].title} ${tabs[0].url}` });

        const element = document.getElementById('input');

        element.focus();

        const { value } = element;
        element.value = '';
        element.value = value;
      });
    });
  }

  addToToday() {
    const { text, user: { _id: user_id, token } } = this.state;

    if (!text) return;

    this.setState({ error: '', loading: true });

    const title = getTodaysTitle();

    axios
      .post(`https://www.twosapp.com/apiV2/user/addToToday`, { text, title, user_id, token })
      .then(() => {
        this.setState({ loading: false, success: true });
      })
      .catch(error => {
        // log('add to today error', error);
        this.setState({ loading: false });
        if (error && error.response && error.response.data === 'Your token is invalid') {

        }
      });
  }

  saveState() {
    chrome.storage.local.set({ twos: this.state }, () => {
      // console.log('save');
    });
  }

  login() {
    const { password, username } = this.state;

    if (!username) {
      return this.setState({ error: 'Please enter your username' });
    }

    if (!password) {
      return this.setState({ error: 'Please enter your password' });
    }

    this.setState({ error: '', loading: true });

    axios
      .post(`https://www.twosapp.com/apiV2/user/login/new`, { user: { password, username } })
      .then(response => {
        this.setState({ error: '', loading: false, loggedIn: true , password: '', user: response.data.user }, this.saveState);
      })
      .catch(error => {
        this.setState({ error: 'Username or password does not match', loading: false });
      });
  }

  render(){
    const { error, loading, loggedIn, password, success, text, user, username } = this.state;

    return user._id ? (
      <div className="main">
        <div className="row bottomPadding">
          <h1 className="username">{`Hi${user.username ? ` ${user.username}` : ''} ✌️`}</h1>
          <button
            className="open"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              window.open('https://www.TwosApp.com', '_blank');
              track('Open twos', { from: 'popup' });
            }}
            target="_blank"
          >
            Open Twos
          </button>
        </div>
        {success ? (
          <div className="success">
            <span>Successfully added to Today</span>
            <button
              className="oneMore"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                this.setState({ error: '', success: false });
              }}
            >
              New
            </button>
          </div>
        ) : (
          <>
            <textarea
              id="input"
              onChange={e => {
                e.stopPropagation();
                e.preventDefault();
                const newText = e.target.value;

                if (newText === `${text}\n`) {
                  this.addToToday();
                  return;
                }

                this.setState({ text: e.target.value }, this.saveState);
              }}
              placeholder="What do you want to remember?"
              value={text}
            />
            {!!error && <span>{error}</span>}
            <div className="help submit">
              {!!text && (
                <button
                  className="clearButton"
                  disabled={loading}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.setState({ text: '' }, this.saveState);
                    // if (isElementFocused(element)) return;

                    const element = document.getElementById('input');

                    element.focus();
                  }}
                >
                  Clear
                </button>
              )}
              <button
                className="submitButton"
                disabled={loading}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.addToToday();
                }}
              >
                {loading ? 'Adding...' : 'Add to Today'}
              </button>
            </div>
          </>
        )}
        <div className="flex">
          <div className="row bottom">
            <p>
              Need help?
            </p>
            <button
              className="help"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open('mailto:help@twosapp.com?subject=Hi Twos', '_blank');
                track('Contact us', { from: 'login view' });
              }}
              target="_blank"
            >
              Contact us
            </button>
          </div>
          <button className="logout" onClick={() => this.setState({ user: {} }, this.saveState)}>Logout</button>
        </div>
      </div>
    ) : (
      <div className="login">
        <h1 className="bottomPadding">Welcome to Twos ✌️</h1>
        <form
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            this.login();
          }}
        >
          <h3>Username</h3>
          <input
            autoComplete="username"
            onChange={e => {
              // log('e', e.target.value);
              this.setState({ error: '', username: e.target.value }, this.saveState);
            }}
            onFocus={() => this.setState({ error: '' })}
            placeholder="Username"
            value={username}
          />
          <h3>Password</h3>
          <input
            autoComplete="current-password"
            onChange={e => {
              this.setState({ error: '', password: e.target.value }, this.saveState);
            }}
            onFocus={() => this.setState({ error: '' })}
            placeholder="Password"
            type="password"
            value={password}
          />
          {!!error && <span>{error}</span>}
          <button
            className="submitButton"
            // disabled={loading}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.login();
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="flex">
          <div className="row bottom">
            <p>
              Need help?
            </p>
            <button
              className="help"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open('mailto:help@twosapp.com?subject=Hi Twos', '_blank');
                track('Contact us', { from: 'login view' });
              }}
              target="_blank"
            >
              Contact us
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Popup.defaultProps = {
  login: {},
};

export default Popup;
