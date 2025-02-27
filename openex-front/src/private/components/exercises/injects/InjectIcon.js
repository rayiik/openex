import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  EmailOutlined,
  SmsOutlined,
  NotificationsActiveOutlined,
  HelpOutlined,
  SpeakerNotesOutlined,
  ApiOutlined,
} from '@mui/icons-material';
import { Mastodon, Twitter } from 'mdi-material-ui';
import Airbus from '../../../../resources/images/contracts/airbus.png';
import CustomTooltip from '../../../../components/CustomTooltip';

const iconSelector = (type, variant, fontSize, done) => {
  let style;
  switch (variant) {
    case 'inline':
      style = {
        width: 20,
        height: 20,
        margin: '0 7px 0 0',
        float: 'left',
      };
      break;
    default:
      style = {
        margin: 0,
      };
  }

  switch (type) {
    case 'openex_email':
      return (
        <EmailOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#cddc39' }}
        />
      );
    case 'openex_ovh_sms':
      return (
        <SmsOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#9c27b0' }}
        />
      );
    case 'openex_manual':
      return (
        <NotificationsActiveOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#009688' }}
        />
      );
    case 'openex_mastodon':
      return (
        <Mastodon
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#e91e63' }}
        />
      );
    case 'openex_lade':
      return (
        <img
          src={`/${window.BASE_PATH ? `${window.BASE_PATH}/` : ''}${Airbus}`}
          alt="Airbus Lade"
          style={{
            width: fontSize === 'small' || variant === 'inline' ? 20 : 24,
            height: fontSize === 'small' || variant === 'inline' ? 20 : 24,
          }}
        />
      );
    case 'openex_gnu_social':
      return (
        <SpeakerNotesOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#f44336' }}
        />
      );
    case 'openex_twitter':
      return (
        <Twitter
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#2196f3' }}
        />
      );
    case 'openex_rest_api':
      return (
        <ApiOutlined
          style={style}
          fontSize={fontSize}
          sx={{ color: done ? '#4caf50' : '#00bcd4' }}
        />
      );
    default:
      return <HelpOutlined style={style} fontSize={fontSize} />;
  }
};

class InjectIcon extends Component {
  render() {
    const { type, size, variant, tooltip, done } = this.props;
    const fontSize = size || 'medium';
    if (tooltip) {
      return (
        <CustomTooltip title={tooltip}>
          {iconSelector(type, variant, fontSize, done)}
        </CustomTooltip>
      );
    }
    return iconSelector(type, variant, fontSize, done);
  }
}

InjectIcon.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.string,
  variant: PropTypes.string,
  done: PropTypes.bool,
};

export default InjectIcon;
