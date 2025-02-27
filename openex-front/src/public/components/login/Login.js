import React, { useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@mui/styles/withStyles';
import Paper from '@mui/material/Paper';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import { VpnKeyOutlined } from '@mui/icons-material';
import logo from '../../../resources/images/logo.png';
import {
  askToken,
  checkKerberos,
  fetchParameters,
} from '../../../actions/Application';
import LoginForm from './LoginForm';
import inject18n from '../../../components/i18n';
import { storeHelper } from '../../../actions/Schema';

const styles = () => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 400,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
});

const Login = (props) => {
  const { classes, parameters, t } = props;
  const { auth_openid_enable: isOpenId, auth_local_enable: isLocal } = parameters;
  const { platform_providers: providers } = parameters;
  const [dimension, setDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const updateWindowDimensions = () => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  };
  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  });
  useEffect(() => {
    props.fetchParameters();
    props.checkKerberos();
  }, []);
  const onSubmit = (data) => props.askToken(data.username, data.password);
  let loginHeight = 260;
  if (isOpenId && isLocal) {
    loginHeight = 350;
  } else if (isOpenId) {
    loginHeight = 150;
  }
  const marginTop = dimension.height / 2 - loginHeight / 2 - 200;
  return (
    <div className={classes.container} style={{ marginTop }}>
      <img src={`/${logo}`} alt="logo" className={classes.logo} />
      {isLocal && (
        <Paper variant="outlined">
          <LoginForm onSubmit={onSubmit} />
        </Paper>
      )}
      {isOpenId
        && (providers ?? []).map((provider) => (
          <div key={provider.provider_name}>
            <Button
              component="a"
              href={provider.provider_uri}
              variant="outlined"
              color="secondary"
              size="small"
              style={{ marginTop: 20 }}
              startIcon={<VpnKeyOutlined />}
            >
              <span>{t(provider.provider_login)}</span>
            </Button>
          </div>
        ))}
    </div>
  );
};

Login.propTypes = {
  t: PropTypes.func,
  demo: PropTypes.string,
  askToken: PropTypes.func,
  checkKerberos: PropTypes.func,
  classes: PropTypes.object,
  parameters: PropTypes.object,
};

const select = (state) => {
  const helper = storeHelper(state);
  const parameters = helper.getSettings() ?? {};
  return { parameters };
};

export default R.compose(
  connect(select, { askToken, checkKerberos, fetchParameters }),
  inject18n,
  withStyles(styles),
)(Login);
