import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { head } from 'ramda';
import { MESSAGING$ } from '../utils/Environment';
import inject18n from './i18n';

class Message extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, error: false, text: '' };
  }

  componentDidMount() {
    this.subscription = MESSAGING$.messages.subscribe({
      next: (messages) => {
        const firstMessage = head(messages);
        if (firstMessage) {
          const text = firstMessage.text instanceof String
            ? this.props.t(firstMessage.text)
            : firstMessage.text;
          const error = firstMessage.type === 'error';
          this.setState({ open: true, error, text });
        }
      },
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleCloseMessage(event, reason) {
    if (reason === 'clickaway') return;
    this.setState({ open: false });
  }

  render() {
    const { t } = this.props;
    const { text, error, open } = this.state;
    return (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        onClose={this.handleCloseMessage.bind(this)}
        autoHideDuration={4000}
      >
        {error ? (
          <Alert severity="error" onClose={this.handleCloseMessage.bind(this)}>
            {text.length > 0 && t(text)}
          </Alert>
        ) : (
          <Alert
            severity="success"
            onClose={this.handleCloseMessage.bind(this)}
          >
            {text.length > 0 && t(text)}
          </Alert>
        )}
      </Snackbar>
    );
  }
}

Message.propTypes = {
  open: PropTypes.bool,
  t: PropTypes.func,
  handleClose: PropTypes.func,
  message: PropTypes.string,
};

export default inject18n(Message);
