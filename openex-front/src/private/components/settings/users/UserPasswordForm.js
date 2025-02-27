import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import { TextField } from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';

class UserPasswordForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    if (
      !values.user_plain_password
      || values.user_plain_password !== values.password_confirmation
    ) {
      errors.user_plain_password = t('Passwords do no match');
    }
    return errors;
  }

  render() {
    const { t, onSubmit, initialValues, handleClose } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit, submitting, pristine }) => (
          <form id="passwordForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="user_plain_password"
              fullWidth={true}
              type="password"
              label={t('Password')}
            />
            <TextField
              variant="standard"
              name="password_confirmation"
              fullWidth={true}
              type="password"
              label={t('Confirmation')}
              style={{ marginTop: 20 }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                color="secondary"
                type="submit"
                disabled={pristine || submitting}
              >
                {t('Update')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

UserPasswordForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default inject18n(UserPasswordForm);
