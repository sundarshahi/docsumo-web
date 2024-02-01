import React from 'react';

const UserContext = React.createContext('user');

export class UserContextProvider extends React.Component {
  render() {
    const { user } = this.props;
    return (
      <UserContext.Provider value={user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

export function withUserContext(Component) {
  return function (props) {
    return (
      <UserContext.Consumer>
        {(user) => <Component {...props} user={user} />}
      </UserContext.Consumer>
    );
  };
}
