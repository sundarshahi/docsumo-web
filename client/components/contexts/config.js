import React from 'react';

const ConfigContext = React.createContext('config');

export class ConfigContextProvider extends React.Component {
  render() {
    const { config } = this.props;
    return (
      <ConfigContext.Provider value={config}>
        {this.props.children}
      </ConfigContext.Provider>
    );
  }
}

export function withConfigContext(Component) {
  return function (props) {
    return (
      <ConfigContext.Consumer>
        {(config) => <Component {...props} config={config} />}
      </ConfigContext.Consumer>
    );
  };
}
