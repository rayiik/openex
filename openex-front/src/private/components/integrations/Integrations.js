import React from 'react';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import {
  HelpOutlined,
  TitleOutlined,
  TextFieldsOutlined,
  ToggleOnOutlined,
  DescriptionOutlined,
  CastForEducationOutlined,
  ListOutlined,
} from '@mui/icons-material';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import { fetchInjectTypes } from '../../../actions/Inject';
import SearchFilter from '../../../components/SearchFilter';
import useSearchAnFilter from '../../../utils/SortingFiltering';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  parameters: {
    marginTop: -10,
  },
}));

const iconField = (type) => {
  switch (type) {
    case 'text':
      return <TitleOutlined color="primary" />;
    case 'textarea':
      return <TextFieldsOutlined color="primary" />;
    case 'checkbox':
      return <ToggleOnOutlined color="primary" />;
    case 'attachment':
      return <DescriptionOutlined color="primary" />;
    case 'audience':
      return <CastForEducationOutlined color="primary" />;
    case 'select':
    case 'dependency-select':
      return <ListOutlined color="primary" />;
    default:
      return <HelpOutlined color="primary" />;
  }
};

const Integrations = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const injectTypes = useHelper((store) => store.getInjectTypes());
  useDataLoader(() => {
    dispatch(fetchInjectTypes());
  });
  const filtering = useSearchAnFilter(null, null, [
    'ttype',
    'tname',
    'name',
    'type',
  ]);
  const types = R.sortWith(
    [R.ascend(R.prop('ttype')), R.ascend(R.prop('tname'))],
    R.values(injectTypes)
      .filter((type) => type.expose === true)
      .map((type) => ({ tname: t(type.name), ttype: t(type.type), ...type })),
  );
  const sortedTypes = filtering.filterAndSort(types);
  return (
    <div className={classes.root}>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
      </div>
      <div className="clearfix" />
      <Grid container={true} spacing={3}>
        {sortedTypes.map((type) => (
          <Grid
            key={type.contract_id}
            item={true}
            xs={6}
            style={{ marginBottom: 30 }}
          >
            <Typography variant="h4">
              [{type.ttype}] {type.tname}
            </Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <List style={{ paddingTop: 0 }}>
                {type.fields.map((field) => (
                  <ListItem key={field.key} divider={true} dense={true}>
                    <ListItemIcon>{iconField(field.type)}</ListItemIcon>
                    <ListItemText primary={t(field.label)} />
                    <Chip
                      size="small"
                      sx={{ height: 15, fontSize: 10 }}
                      label={field.mandatory ? t('Mandatory') : t('Optional')}
                      color={field.mandatory ? 'secondary' : 'primary'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Integrations;
